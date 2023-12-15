import puppeteer, { HTTPResponse } from 'puppeteer';

(async () => {

    try {
        const wsChromeEndpointurl = 'ws://127.0.0.1:9223/devtools/browser/0e29bf38-7cdb-4781-837d-0f9c54a02499';
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointurl,
            defaultViewport: false
        });
        const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
        const rowInit = 550;
        const rowEnd = 601;
        const increment = 1; ///1:incrment ; -1: decrement
        const operationTimeout = 600000;
        const safeWaitTime = 1000;
        const web1URL = "https://webland2.ap.gov.in/POLR6/NewProcess/MutationsLists.aspx??enc=9q/Wft5R9cu2OR52HUgmmJVzEVgCCgNemLlt6/95XwAWkG1m/3mDIrKnv6QGUSb6xrLNdEAAlTxiMMK9WyIEMw==";

        const page = await browser.newPage();
        // Navigate the page to a URL
        await page.goto(web1URL, { waitUntil: 'networkidle0', timeout: operationTimeout });
        console.log("started..");
        page.on('dialog', async dialog => {   //on event listener trigger

            console.log(dialog.message());  //get alert message

            await dialog.dismiss();        //accept alert

        })

        for (var i = rowInit; i < rowEnd; i+increment) {
            let subresult = await page.evaluate(() => {
                let allbtns = document.getElementsByClassName('btn btn-primary');
                let savebtnIds = [];
                for (let k = 0; k < allbtns.length; k++) {
                    if (allbtns[k].id.startsWith('GridView1_btnGenerateDraftForm')) {
                        savebtnIds.push(allbtns[k].id);
                    }
                }
                return savebtnIds;
            });

            //selection

            var savebtnId = await subresult[i];
            console.log(savebtnId);
            var waitPageNav0 = page.waitForNavigation({ timeout: operationTimeout });
            let btnclick = await page.evaluate((btnId) => {
                let btn1 = document.getElementById(btnId);
                btn1.click();
            }, savebtnId);
            await waitPageNav0;
            await delay(1000);
            console.log("navigated to form 8");

            let fwdToDTBtn = 'btnForwardToTAHSILDAR'
            const promise02 = page.waitForResponse((response) => {
                return response.url().startsWith("https://webland2.ap.gov.in/POLR6/NewProcess/Form8.aspx")
            }, { timeout: operationTimeout });

            let btnclick1 = await page.evaluate((btnId) => {
                let btn1 = document.getElementById('btnForwardToTAHSILDAR');
                btn1.click();
            }, fwdToDTBtn);
            await promise02;

            console.log("going back");
            await delay(1000);
            await page.goBack();
        }



    }
    catch (err) {
        console.log(err);
    }

})();
