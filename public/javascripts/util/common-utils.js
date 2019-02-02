const timeProvider = window.performance !== undefined && window.performance.now !== undefined
    ? window.performance : Date;
export const currentTime = function () {
    return timeProvider.now();
};
