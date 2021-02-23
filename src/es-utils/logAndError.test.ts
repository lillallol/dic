import { logAndError } from "./logAndError";

describe(logAndError.name,() => {
	it("throws error with message the provided array message",() => {
		const arrayMessage = ["Hello","world","!"];
		expect(() => logAndError(arrayMessage)).toThrow("Hello world !");
	});
	it("console errors the provided array message",() => {
		const arrayMessage = ["Hello","world","!"];
		const consoleErrorSpy = spyOn(console,"error");
		try {
			logAndError(arrayMessage)
		}catch(e) {
			expect(consoleErrorSpy).toHaveBeenCalledWith(...arrayMessage);
		}
	});
});