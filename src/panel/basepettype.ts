import { PetColor, PetSize, PetSpeed } from '../common/types';
import { IPetType } from './states';
import { ISequenceTree } from './sequences';
import {
    States,
    IState,
    resolveState,
    PetInstanceState,
    isStateAboveGround,
    BallState,
    ChaseState,
    HorizontalDirection,
    FrameResult,
} from './states';

export class InvalidStateError extends Error {
    fromState: States;
    petType: string;

    constructor(fromState: States, petType: string) {
        super(`Invalid state ${fromState} for pet type ${petType}`);
        this.fromState = fromState;
        this.petType = petType;
    }
}

export abstract class BasePetType implements IPetType {
    label: string = 'base';
    static count: number = 0;
    sequence: ISequenceTree = {
        startingState: States.sitIdle,
        sequenceStates: [],
    };
    static possibleColors: PetColor[];
    currentState: IState;
    currentStateEnum: States;
    holdState: IState | undefined;
    holdStateEnum: States | undefined;
    private el: HTMLImageElement;
    private collision: HTMLDivElement;
    private speech: HTMLDivElement;
    private _left: number;
    private _bottom: number;
    petRoot: string;
    _floor: number;
    _friend: IPetType | undefined;
    private _name: string;
    private _speed: number;
    private _size: PetSize;
    protected _climbSpeed: number = 1;
    protected _climbHeight: number = 100;
    protected _fallSpeed: number = 5;

    private _isDragging: boolean = false;
    private _isFlung: boolean = false;
    private _flingVx: number = 0;
    private _flingVy: number = 0;

    private _flingGravity: number = 0.45;
    private _flingDamping: number = 0.99;
    private _flingTraction: number = 0.75;
    private _maxFlingSpeed: number = 50;

    constructor(
        spriteElement: HTMLImageElement,
        collisionElement: HTMLDivElement,
        speechElement: HTMLDivElement,
        size: PetSize,
        left: number,
        bottom: number,
        petRoot: string,
        floor: number,
        name: string,
        speed: number,
    ) {
        this.el = spriteElement;
        this.collision = collisionElement;
        this.speech = speechElement;
        this.petRoot = petRoot;
        this._floor = floor;
        this._left = left;
        this._bottom = bottom;
        this.initSprite(size, left, bottom);
        this.currentStateEnum = this.sequence.startingState;
        this.currentState = resolveState(this.currentStateEnum, this);

        this._name = name;
        this._size = size;
        this._speed = this.randomizeSpeed(speed);
        if (this._name.toLowerCase() === 'debug') {
            console.log(
                `Creating pet ${this._name} of size ${this._size} at position (${this._left}, ${this._bottom}) with speed ${this._speed}`,
            );
        }

        // Increment the static count of the Pet class that the constructor belongs to
        (this.constructor as any).count += 1;
    }

    initSprite(petSize: PetSize, left: number, bottom: number) {
        this.el.style.left = `${left}px`;
        this.el.style.bottom = `${bottom}px`;
        this.el.style.width = 'auto';
        this.el.style.height = 'auto';
        this.el.style.maxWidth = `${this.calculateSpriteWidth(petSize)}px`;
        this.el.style.maxHeight = `${this.calculateSpriteWidth(petSize)}px`;
        this.collision.style.left = `${left}px`;
        this.collision.style.bottom = `${bottom}px`;
        this.collision.style.width = `${this.calculateSpriteWidth(petSize)}px`;
        this.collision.style.height = `${this.calculateSpriteWidth(petSize)}px`;
        this.speech.style.left = `${left}px`;
        this.speech.style.bottom = `${
            bottom + this.calculateSpriteWidth(petSize)
        }px`;
        this.hideSpeechBubble();
    }

    get left(): number {
        return this._left;
    }

    get bottom(): number {
        return this._bottom;
    }

    private repositionAccompanyingElements() {
        this.collision.style.left = `${this._left}px`;
        this.collision.style.bottom = `${this._bottom}px`;
        this.speech.style.left = `${this._left}px`;
        this.speech.style.bottom = `${
            this._bottom + this.calculateSpriteWidth(this._size)
        }px`;
    }

    calculateSpriteWidth(size: PetSize): number {
        if (size === PetSize.nano) {
            return 30;
        } else if (size === PetSize.small) {
            return 40;
        } else if (size === PetSize.medium) {
            return 55;
        } else if (size === PetSize.large) {
            return 110;
        } else {
            return 30; // Shrug
        }
    }

    positionBottom(bottom: number): void {
        this._bottom = bottom;
        this.el.style.bottom = `${this._bottom}px`;
        this.repositionAccompanyingElements();
    }

    positionLeft(left: number): void {
        this._left = left;
        this.el.style.left = `${this._left}px`;
        this.repositionAccompanyingElements();
    }

    get width(): number {
        return this.el.width;
    }

    get floor(): number {
        return this._floor;
    }

    get hello(): string {
        // return the sound of the name of the animal
        return ` says hello 👋!`;
    }

    getState(): PetInstanceState {
        return { currentStateEnum: this.currentStateEnum };
    }

    get speed(): number {
        return this._speed;
    }

    randomizeSpeed(speed: number): number {
        const min = speed * 0.7;
        const max = speed * 1.3;
        const newSpeed = Math.random() * (max - min) + min;
        return newSpeed;
    }

    /**
     * The speed at which the pet can climb.
     * Default is 1.
     */
    get climbSpeed(): number {
        return this._climbSpeed;
    }

    /**
     * The height to which a pet can climb.
     * Default is 100.
     */
    get climbHeight(): number {
        return this._climbHeight;
    }

    /**
     * The speed at which the pet falls when it is in the air.
     * Default is 5.
     */
    get fallSpeed(): number {
        return this._fallSpeed;
    }

    get isMoving(): boolean {
        return this._speed !== PetSpeed.still;
    }

    recoverFriend(friend: IPetType) {
        // Recover friends..
        this._friend = friend;
    }

    recoverState(state: PetInstanceState) {
        // TODO : Resolve a bug where if it was swiping before, it would fail
        // because holdState is no longer valid.
        this.currentStateEnum = state.currentStateEnum ?? States.sitIdle;
        this.currentState = resolveState(this.currentStateEnum, this);

        if (!isStateAboveGround(this.currentStateEnum)) {
            // Reset the bottom of the sprite to the floor as the theme
            // has likely changed.
            this.positionBottom(this.floor);
        }
    }

    get canSwipe() {
        return (
            !this._isDragging &&
            !this._isFlung &&
            !isStateAboveGround(this.currentStateEnum)
        );
    }

    get canChase() {
        return !isStateAboveGround(this.currentStateEnum) && this.isMoving;
    }

    showSpeechBubble(message: string, duration: number = 3000) {
        this.speech.innerHTML = message;
        this.speech.style.display = 'block';
        setTimeout(() => {
            this.hideSpeechBubble();
        }, duration);
    }

    hideSpeechBubble() {
        this.speech.style.display = 'none';
    }

    swipe() {
        if (this.currentStateEnum === States.swipe) {
            return;
        }
        this.holdState = this.currentState;
        this.holdStateEnum = this.currentStateEnum;
        this.currentStateEnum = States.swipe;
        this.currentState = resolveState(this.currentStateEnum, this);
        this.showSpeechBubble('👋');
    }

    get isDragging(): boolean {
        return this._isDragging;
    }

    startDrag(): void {
        this._isDragging = true;
        this._isFlung = false;
        // Only save holdState if not already holding one (e.g. mid-swipe)
        if (!this.holdState) {
            this.holdState = this.currentState;
            this.holdStateEnum = this.currentStateEnum;
        }
    }

    endDrag(): void {
        this._isDragging = false;
        if (this.holdState && this.holdStateEnum) {
            this.currentState = this.holdState;
            this.currentStateEnum = this.holdStateEnum;
            this.holdState = undefined;
            this.holdStateEnum = undefined;
        } else {
            this.currentStateEnum = this.sequence.startingState;
            this.currentState = resolveState(this.currentStateEnum, this);
        }
    }

    configureFling(
        gravity: number,
        damping: number,
        traction: number,
        maxSpeed: number,
    ): void {
        this._flingGravity = gravity;
        this._flingDamping = damping;
        this._flingTraction = traction;
        this._maxFlingSpeed = maxSpeed;
    }

    startFling(vx: number, vy: number): void {
        this._isDragging = false;
        this._isFlung = true;
        this._flingVx = Math.max(
            -this._maxFlingSpeed,
            Math.min(this._maxFlingSpeed, vx),
        );
        this._flingVy = Math.max(
            -this._maxFlingSpeed,
            Math.min(this._maxFlingSpeed, vy),
        );
        // holdState saved by startDrag() will be restored when fling ends
    }

    private _runFlingPhysics(): void {
        this._flingVx *= this._flingDamping;
        this._flingVy -= this._flingGravity;

        let newLeft = this._left + this._flingVx;
        let newBottom = this._bottom + this._flingVy;

        // Ceiling clamp
        const viewportH = window.innerHeight || 600;
        if (newBottom > viewportH) {
            newBottom = viewportH;
            this._flingVy = -Math.abs(this._flingVy) * 0.5;
        }

        // Horizontal wall bounce
        const viewportW = window.innerWidth || 800;
        const maxLeft = viewportW - this.width;
        if (newLeft < 0) {
            newLeft = 0;
            this._flingVx = Math.abs(this._flingVx) * 0.5;
        } else if (maxLeft > 0 && newLeft > maxLeft) {
            newLeft = maxLeft;
            this._flingVx = -Math.abs(this._flingVx) * 0.5;
        }

        // Floor collision
        if (newBottom <= this._floor) {
            newBottom = this._floor;
            this._flingVy = 0;
            this._flingVx *= this._flingTraction;

            if (Math.abs(this._flingVx) < 0.5) {
                this._isFlung = false;
                if (this.holdState && this.holdStateEnum) {
                    this.currentState = this.holdState;
                    this.currentStateEnum = this.holdStateEnum;
                    this.holdState = undefined;
                    this.holdStateEnum = undefined;
                } else {
                    this.currentStateEnum = this.sequence.startingState;
                    this.currentState = resolveState(
                        this.currentStateEnum,
                        this,
                    );
                }
            }
        }

        this.positionLeft(newLeft);
        this.positionBottom(newBottom);

        if (this._flingVx < -0.5) {
            this.faceLeft();
        } else if (this._flingVx > 0.5) {
            this.faceRight();
        }
    }

    get isFlung(): boolean {
        return this._isFlung;
    }

    tickFling() {
        this._runFlingPhysics();
    }

    chase(ballState: BallState, canvas: HTMLCanvasElement) {
        this.currentStateEnum = States.chase;
        this.currentState = new ChaseState(this, ballState, canvas);
    }

    faceLeft() {
        this.el.style.transform = 'scaleX(-1)';
    }

    faceRight() {
        this.el.style.transform = 'scaleX(1)';
    }

    setAnimation(face: string) {
        if (this.el.src.endsWith(`_${face}_8fps.gif`)) {
            return;
        }
        this.el.src = `${this.petRoot}_${face}_8fps.gif`;
    }

    chooseNextState(fromState: States): States {
        // Work out next state
        var possibleNextStates: States[] | undefined = undefined;
        for (var i = 0; i < this.sequence.sequenceStates.length; i++) {
            if (this.sequence.sequenceStates[i].state === fromState) {
                possibleNextStates =
                    this.sequence.sequenceStates[i].possibleNextStates;
                break;
            }
        }
        if (!possibleNextStates) {
            throw new InvalidStateError(fromState, this.label);
        }
        // randomly choose the next state
        const idx = Math.floor(Math.random() * possibleNextStates.length);
        return possibleNextStates[idx];
    }

    nextFrame() {
        if (this._isDragging) {
            return;
        }
        if (this._isFlung) {
            // Physics are driven by a requestAnimationFrame loop in main.ts
            return;
        }
        if (
            this.currentState.horizontalDirection === HorizontalDirection.left
        ) {
            this.faceLeft();
        } else if (
            this.currentState.horizontalDirection === HorizontalDirection.right
        ) {
            this.faceRight();
        }
        this.setAnimation(this.currentState.spriteLabel);

        // What's my buddy doing?
        if (
            this.hasFriend &&
            this.currentStateEnum !== States.chaseFriend &&
            this.isMoving
        ) {
            if (
                this.friend?.isPlaying &&
                !isStateAboveGround(this.currentStateEnum)
            ) {
                this.currentState = resolveState(States.chaseFriend, this);
                this.currentStateEnum = States.chaseFriend;
                return;
            }
        }

        var frameResult = this.currentState.nextFrame();
        if (frameResult === FrameResult.stateComplete) {
            // If recovering from swipe..
            if (this.holdState && this.holdStateEnum) {
                this.currentState = this.holdState;
                this.currentStateEnum = this.holdStateEnum;
                this.holdState = undefined;
                this.holdStateEnum = undefined;
                return;
            }

            var nextState = this.chooseNextState(this.currentStateEnum);
            this.currentState = resolveState(nextState, this);
            this.currentStateEnum = nextState;
        } else if (frameResult === FrameResult.stateCancel) {
            if (this.currentStateEnum === States.chase) {
                var nextState = this.chooseNextState(States.idleWithBall);
                this.currentState = resolveState(nextState, this);
                this.currentStateEnum = nextState;
            } else if (this.currentStateEnum === States.chaseFriend) {
                var nextState = this.chooseNextState(States.idleWithBall);
                this.currentState = resolveState(nextState, this);
                this.currentStateEnum = nextState;
            }
        }
    }

    get hasFriend(): boolean {
        return this._friend !== undefined;
    }

    get friend(): IPetType | undefined {
        return this._friend;
    }

    get name(): string {
        return this._name;
    }

    makeFriendsWith(friend: IPetType): boolean {
        this._friend = friend;
        console.log(this.name, ": I'm now friends ❤️ with ", friend.name);
        return true;
    }

    get isPlaying(): boolean {
        return (
            this.isMoving &&
            (this.currentStateEnum === States.runRight ||
                this.currentStateEnum === States.runLeft)
        );
    }

    get emoji(): string {
        return '🐶';
    }

    get size(): PetSize {
        return this._size;
    }

    remove(): void {}
}
