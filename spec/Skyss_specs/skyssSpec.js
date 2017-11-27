describe("Skyss", function() {
    const skyss = require('../../tools/skyss.js')
    const moment = require('../../public/javascripts/libraries/momentWithLocals.js');
    it("should create a valid url for Skyss", function() {
        const validUrl = 'https://reiseplanlegger.skyss.no/scripts/TravelMagic/TravelMagicWE.dll/svar?from=Brann%20stadion%2C%20bybanestopp%20(Bergen)&to=Byparken%2C%20bybanestopp%20(Bergen)&direction=1&lang=nn&instant=1&date=26.11.2017&time=09:15';
        const testUrl = skyss.createSkyssUrl('Brann stadion, bybanestopp (Bergen)', 'Byparken, bybanestopp (Bergen)', '26.11.2017', '09:15');
        expect(testUrl).toEqual(validUrl);
    });


    describe("Date utils for Skyss", function() {
        it("should format todays date in the following format: day.month.year", function() {
            const now = moment("1993-01-11");
            const formattedDate = skyss.formatDate(now.date(), now.month(), now.year());
            expect('11.01.1993').toEqual(formattedDate);
        });

        it("should append 0 to date values less than 10", function() {
            const now = moment("1993-01-01");
            const formattedDate = skyss.formatDate(now.date(), now.month(), now.year());
            expect('01.01.1993').toEqual(formattedDate);
        });

        it("should format the correct time with hour:minute format with values less than 10", function() {
            const formattedTime = skyss.formatTime(1, 1);
            expect('01:01').toEqual(formattedTime);
        });

        it("should format the correct time with hour:minute format", function() {
            const formattedTime = skyss.formatTime(10, 10);
            expect('10:10').toEqual(formattedTime);
        });
    });
});