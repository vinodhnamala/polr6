import puppeteer, { HTTPResponse } from 'puppeteer';

(async () => {

  try {
    const wsChromeEndpointurl = 'ws://127.0.0.1:9223/devtools/browser/7aab48f8-c1c5-47f0-979a-5a12c89ea49d';
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointurl,
      defaultViewport: false
    });
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const lpmInitValue = 498;
    const lpmEndValue = 520;
    const increment = 1; ///1:incrment ; -1: decrement
    const operationTimeout = 600000;
    const safeWaitTime = 1000;
    const web1URL = "https://webland2.ap.gov.in/POLR6/NewProcess/DraftLandRegister.aspx";

    const page = await browser.newPage();
    // Navigate the page to a URL
    await page.goto(web1URL, { waitUntil: 'networkidle0', timeout: operationTimeout });
    console.log("started..");
    page.on('dialog', async dialog => {   //on event listener trigger

      console.log(dialog.message());  //get alert message

      await dialog.accept();        //accept alert or dismiss

    })
    await page.waitForSelector("#ddlvillage", { timeout: 0 });
    const v1 = await page.$('[name="ddlvillage"]')
    await v1.select("1050016");

    const v2 = await page.$('[name="btngetdetails"]')
    var waitPageNav0 = page.waitForNavigation({ timeout: operationTimeout });
    await v2.click();
    await waitPageNav0;

    for (let lpmVal = lpmInitValue; true; lpmVal = lpmVal + (2 * increment)) {
      if (lpmVal == lpmEndValue) {
        console.log("condition not met/completed");
        break;
      }
      console.log(new Date(), " selecting lpm Value:", lpmVal);
      await page.waitForSelector("#ddlLPMno");
      let lpm = await page.$('[name="ddlLPMno"]')
      const promise00 = page.waitForResponse((response) => {
        return response.url().startsWith(web1URL)
      }, { timeout: operationTimeout });
      await lpm.select(lpmVal.toString());
      await promise00;
      await delay(safeWaitTime);
      await page.waitForSelector("#ddlLPMno");
      let lpmText = await page.evaluate(() => { return $("#ddlLPMno option:selected").text(); });
      console.log(new Date(), " selected LPM:", lpmText);
      await page.waitForSelector("#ddlRowRange");

      let rowrangeopt = await page.evaluate(() => {
        let sed1 = document.getElementById('ddlRowRange');
        let sed1op = sed1.options;
        let sedopt11 = [];
        for (let z1 = 0; z1 < sed1op.length; z1++) {
          sedopt11.push(sed1op[z1].value);
        }
        return sedopt11;
      });
      console.log(rowrangeopt);
      for (let mn = 0; mn < rowrangeopt.length; mn++) {
        if (mn > 0) {
          let rowrng1 = await page.$('[name="ddlRowRange"]')
          const promise01 = page.waitForResponse((response) => {
            return response.url().startsWith(web1URL)
          }, { timeout: operationTimeout });
          await rowrng1.select(rowrangeopt[mn]);
          await promise01;
          await delay(safeWaitTime);
        }
        //test with rowrange*2
        for (let j = 0; j < (rowrangeopt.length * 2); j++) {

          let subresult = await page.evaluate(() => {
            let allInputs = document.getElementsByTagName('input');
            let allboxes = [];
            for (let k = 0; k < allInputs.length; k++) {
              if (allInputs[k].id.startsWith('grgroundtruth_chckSelect_') && allInputs[k].type == 'checkbox') {
                let _temp1 = allInputs[k].id;
                allboxes.push(_temp1);
              }
            }
            let fiveboxes = allboxes.slice(0, 5);
            for (let mh = 0; mh < fiveboxes.length; mh++) {
              let _t1 = document.getElementById(fiveboxes[mh]);
              _t1.checked = true;
            }
            return fiveboxes;
          });

          if (subresult.length == 0) {
            console.log("......");
            break;
          } else {
            await page.evaluate(() => {
              let digi = document.getElementById('btnbulkdigital');
              digi.click();
            }
            );
          }
          console.log("check check");
          const promise02 = page.waitForResponse((response) => {
            return response.url().startsWith(web1URL)
          }, { timeout: operationTimeout });
          await promise02;
          await delay(safeWaitTime);
          await delay(10000);
        }

      }


    }

  }
  catch (err) {
    console.log(err);
  }

})();