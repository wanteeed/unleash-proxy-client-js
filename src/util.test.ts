import { IContext } from '.';
import { computeContextHashValue, urlWithContextAsQuery } from './util';

test('should not add paramters to URL', async () => {
    const someUrl = new URL('https://test.com');

    //@ts-expect-error on purpose for testing!
    const result = urlWithContextAsQuery(someUrl, {});

    expect(result.toString()).toBe('https://test.com/');
});

test('should add context as query params', async () => {
    const someUrl = new URL('https://test.com');

    const result = urlWithContextAsQuery(someUrl, {
        appName: 'test',
        userId: '1234A',
    });

    expect(result.toString()).toBe(
        'https://test.com/?appName=test&userId=1234A'
    );
});

test('should add context properties as query params', async () => {
    const someUrl = new URL('https://test.com');

    const result = urlWithContextAsQuery(someUrl, {
        appName: 'test',
        userId: '1234A',
        properties: { custom1: 'test', custom2: 'test2' },
    });

    expect(result.toString()).toBe(
        'https://test.com/?appName=test&userId=1234A&properties%5Bcustom1%5D=test&properties%5Bcustom2%5D=test2'
    );
});

test('should exclude context properties that are null or undefined', async () => {
    const someUrl = new URL('https://test.com');

    const result = urlWithContextAsQuery(someUrl, {
        appName: 'test',
        userId: undefined,
        properties: {
            custom1: 'test',
            custom2: 'test2',
            //@ts-expect-error this shouldn't be allowed if you're using TS, but
            //you could probably force it
            custom3: null,
            //@ts-expect-error same as the null property above
            custom4: undefined,
        },
    });

    expect(result.toString()).toBe(
        'https://test.com/?appName=test&properties%5Bcustom1%5D=test&properties%5Bcustom2%5D=test2'
    );
});

describe('sortObjectProperties', () => {
    test('Should compute hash value for a simple object', () => {
        const obj: IContext = { appName: '1', currentTime: '2', environment: '3', userId: '4' };
        const hashValue = computeContextHashValue(obj);
        expect(hashValue).toBe('{"appName":"1","currentTime":"2","environment":"3","userId":"4"}');
    });

    test('Should compute hash value for an object with not sorted keys', () => {
        const obj: IContext = { userId: '4', appName: '1', environment: '3', currentTime: '2' };
        const hashValue = computeContextHashValue(obj);
        expect(hashValue).toBe('{"appName":"1","currentTime":"2","environment":"3","userId":"4"}');
    });

    test('Should compute hash value for an object with nested objects and not sorted keys', () => {
        const obj: IContext = { appName: '1', properties: { d: "4", c: "3" }, currentTime: '2' };
        const hashValue = computeContextHashValue(obj);
        expect(hashValue).toBe('{"appName":"1","currentTime":"2","properties":{"c":"3","d":"4"}}');
    });
});
