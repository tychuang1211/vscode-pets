import { PetColor } from '../../common/types';
import { BasePetType } from '../basepettype';
import { States } from '../states';

export class Sheep extends BasePetType {
    label = 'sheep';
    static possibleColors = [
        PetColor.sky
    ];
    sequence = {
        startingState: States.sitIdle,
        sequenceStates: [
            {
                state: States.sitIdle,
                possibleNextStates: [States.walkRight, States.runRight],
            },
            {
                state: States.walkRight,
                possibleNextStates: [States.walkLeft, States.runLeft],
            },
            {
                state: States.runRight,
                possibleNextStates: [States.walkLeft, States.runLeft],
            },
            {
                state: States.walkLeft,
                possibleNextStates: [
                    States.sitIdle,
                    States.walkRight,
                    States.runRight,
                ],
            },
            {
                state: States.runLeft,
                possibleNextStates: [
                    States.sitIdle,
                    States.walkRight,
                    States.runRight,
                ],
            },
            {
                state: States.chase,
                possibleNextStates: [States.idleWithBall],
            },
            {
                state: States.idleWithBall,
                possibleNextStates: [
                    States.walkRight,
                    States.walkLeft,
                    States.runLeft,
                    States.runRight,
                ],
            },
        ],
    };
    get emoji(): string {
        return '🐑';
    }
    get hello(): string {
        return `Baaa!`;
    }
}

export const SHEEP_NAMES: ReadonlyArray<string> = [
    'Baa Baa',
    'Dolly',
    'Shaun',
    'Lamb Chop',
    'Fleece',
    'Cloud',
    'Snowball',
];
