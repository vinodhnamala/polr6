import puppeteer from 'puppeteer';

(async () => {

  try {
    const wsChromeEndpointurl = 'ws://127.0.0.1:9223/devtools/browser/51be1ffb-4cc2-476f-b7dd-b5fbfd457c7f';
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointurl,
      defaultViewport: false
    });
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const lpmInitValue = 108;
    const lpmEndValue = 2;
    const saveWaitTime = 7000;
    const lpmChangeWaitTime = 7000;
    const rowChangeWaitTime = 7000;
    const increment = -1; ///1:incrment ; -1: decrement

    const page = await browser.newPage();
    // Navigate the page to a URL
    await page.goto('https://webland2.ap.gov.in/POLR6/NewProcess/DraftLandRegister.aspx');
    await delay(5000);
    page.on('dialog', async dialog => {   //on event listener trigger

      console.log(dialog.message());  //get alert message

      await dialog.dismiss();        //accept alert

    })
    await page.waitForSelector("#ddlvillage", { timeout: 0 });
    const v1 = await page.$('[name="ddlvillage"]')
    await v1.select("1050016");

    const v2 = await page.$('[name="btngetdetails"]')
    await v2.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 });

    for (let lpmVal = lpmInitValue; true; lpmVal = lpmVal + (2 * increment)) {
      if(lpmVal==lpmEndValue){
        console("condition not met");
        break;
      }
      var datetime = new Date();
      console.log(datetime);
      console.log("lpm:", lpmVal);
      await page.waitForSelector("#ddlLPMno");
      let lpm = await page.$('[name="ddlLPMno"]')
      await lpm.select(lpmVal.toString());
      await delay(lpmChangeWaitTime);

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
          await rowrng1.select(rowrangeopt[mn]);
          await delay(rowChangeWaitTime);
        }
        let result = await page.evaluate(() => {
          let allbtns = document.getElementsByClassName('btn btn-primary');
          let savebtnIds = [];
          for (let k = 0; k < allbtns.length; k++) {
            if (allbtns[k].id.startsWith('grgroundtruth_btnsave_')) {
              let _temp1 = allbtns[k].id;
              let _tt1 = document.getElementById(_temp1);
              if (_tt1.parentNode.parentNode.parentNode.style.backgroundColor == 'white')
                savebtnIds.push(allbtns[k].id);
            }
          }
          return savebtnIds;
        });
        console.log(result);
        for (let j = 0; j < result.length; j++) {
          var savebtnId = await result[j];
          // await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 });
          console.log(savebtnId);
          var howacquiredId = '#' + savebtnId.replace('grgroundtruth_btnsave_', 'grgroundtruth_ddlrightsreq_');
          await page.waitForSelector(howacquiredId, { timeout: 0 });
          let howacquireddl = await page.$(howacquiredId);
          let option = await page.$eval(howacquiredId, node => node.value);
          let availableOptionsddl = await page.evaluate((selId) => {
            let selectElement = document.getElementById(selId.substring(1));
            let availableOptions = selectElement.options;
            let availOptionVal = [];
            for (let z = 0; z < availableOptions.length; z++) {
              availOptionVal.push(availableOptions[z].value);
            }
            return availOptionVal;
          }, howacquiredId);
          if (option == 0) {
            let _val1 = await availableOptionsddl.find(p1 => p1 == '1');
            if (_val1 != undefined) {
              await howacquireddl.select('1');
              console.log("setting as ancestral");
            }
            let _val2 = await availableOptionsddl.find(p1 => p1 == '13');
            if (_val2 != undefined) {
              await howacquireddl.select('13');
              console.log("setting as govt");
            }
          }
          let btnclick = await page.evaluate((btnId) => {
            let btn1 = document.getElementById(btnId);
            btn1.click();
          }, savebtnId);
          await delay(saveWaitTime);
        }

      }


    }

  }
  catch (err) {
    console.log(err);
  }

})();