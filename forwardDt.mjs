import puppeteer, { HTTPResponse } from 'puppeteer';

(async () => {

  try {
    const wsChromeEndpointurl = 'ws://127.0.0.1:9223/devtools/browser/fd79421f-ae55-4655-b5a0-c58e63d9436a';
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointurl,
      defaultViewport: false
    });
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const surveyInitVal=607;
    const surveyEndVal=630;
    const increment = 1; ///1:incrment ; -1: decrement
    const operationTimeout = 600000;
    const safeWaitTime = 1000;
    const web1URL = "https://webland2.ap.gov.in/POLR6/NewProcess/Ground_Truthing.aspx";

    const page = await browser.newPage();
    // Navigate the page to a URL
    await page.goto(web1URL, { waitUntil: 'networkidle0', timeout: operationTimeout });
    console.log("started..");
    page.on('dialog', async dialog => {   //on event listener trigger

      console.log(dialog.message());  //get alert message

      await dialog.dismiss();        //accept alert

    })
    await page.waitForSelector("#ddlvillage", { timeout: 0 });
    const v1 = await page.$('[name="ddlvillage"]')
    await v1.select("2404017");

    const v2 = await page.$('[name="btngetdetails"]')
    var waitPageNav0 = page.waitForNavigation({ timeout: operationTimeout });
    await v2.click();
    await waitPageNav0;

    for (let surveyVal = surveyInitVal; true; surveyVal = surveyVal + (1 * increment)) {
      if (surveyVal == surveyEndVal) {
        console.log("condition not met/completed");
        break;
      }
      console.log(new Date() , " selecting survey Value:", surveyVal);
      await page.waitForSelector("#ddlsurveyno");
      let survey = await page.$('[name="ddlsurveyno"]')
      const promise00 = page.waitForResponse((response) => {
        return response.url().startsWith(web1URL)
      }, { timeout: operationTimeout });
      await survey.select(surveyVal.toString());
      await promise00;
      await delay(safeWaitTime);
      await page.waitForSelector("#ddlsurveyno");
      let surveyText = await page.evaluate(() => {return $("#ddlsurveyno option:selected").text();});
      console.log(new Date(), " selected survey:", surveyText);
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

        //test with rowrange*10
        for (let j = 0; j < (rowrangeopt.length*10); j++) {

            console.log("***");

          let subresult = await page.evaluate(() => {
            let allbtns = document.getElementsByClassName('btn btn-primary');
            let savebtnIds = [];
            for (let k = 0; k < allbtns.length; k++) {
              if (allbtns[k].id.startsWith('grgroundtruth_btnpush_')) {
                let _temp1 = allbtns[k].id;
                let _tt1 = document.getElementById(_temp1);
               // if (_tt1.parentNode.parentNode.parentNode.style.backgroundColor == 'white')
                  savebtnIds.push(allbtns[k].id);
              }
            }
            return savebtnIds;
          });

          if (subresult.length == 0) {
            console.log("......");
            break;
          }
          //selection
          
          var savebtnId = await subresult[0];
          console.log(savebtnId);

          let btnclick = await page.evaluate((btnId) => {
            let btn1 = document.getElementById(btnId);
            btn1.click();
          }, savebtnId);      
          const promise02 = page.waitForResponse((response) => {
            return response.url().startsWith(web1URL)
          }, { timeout: operationTimeout });
          await promise02;
          await delay(1000);
        }

      }


    }

  }
  catch (err) {
    console.log(err);
  }

})();