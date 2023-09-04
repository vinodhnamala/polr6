import puppeteer, { HTTPResponse } from 'puppeteer';
import fs from 'fs';

(async () => {

  try {
    const wsChromeEndpointurl = 'ws://127.0.0.1:9223/devtools/browser/f07fcb2e-8731-43ee-b1ab-a4d79946685b';
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsChromeEndpointurl,
      defaultViewport: false
    });
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const lpmInitValue = 2392;
    const lpmEndValue = 2400;
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

      await dialog.dismiss();        //accept alert

    })
    await page.waitForSelector("#ddlvillage", { timeout: 0 });
    const v1 = await page.$('[name="ddlvillage"]')
    await v1.select("1050016");

    const v2 = await page.$('[name="btngetdetails"]')
    var waitPageNav0 = page.waitForNavigation({ timeout: operationTimeout });
    await v2.click();
    await waitPageNav0;
    await delay(safeWaitTime);
    let lpmOptions = await page.evaluate(() => {
      let sed1 = document.getElementById('ddlLPMno');
      let sed1op = sed1.options;
      let sedopt11 = [];
      for (let z1 = 0; z1 < sed1op.length; z1++) {
        let _t1 = {
          lpmRange: sed1op[z1].innerHTML,
          lpmValue: sed1op[z1].value
        };
        sedopt11.push(_t1);
      }
      return sedopt11;
    });

    //filter
    let requiredLPM = [
      
      '2340','2417','2423'
    ];
    let filteredlpmOptions = [];
    for (let y = 0; y < lpmOptions.length; y++) {
      let _lpmText = lpmOptions[y].lpmRange;
      let _lpmt1 = _lpmText.split('-');
      for (let q = 0; q < _lpmt1.length; q++) {
        if (requiredLPM.find(x => x == _lpmt1[q].toString())) {
          filteredlpmOptions.push(lpmOptions[y]);
          break;
        }
      }
    }
    //filter complete

    for (let zzz = 0; zzz < filteredlpmOptions.length; zzz++) {
      let lpmVal = filteredlpmOptions[zzz].lpmValue;
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
        await delay(safeWaitTime);
        //grey records
        let greyRecords = await page.evaluate(() => {
          let tbl = document.getElementById('grgroundtruth')
          let greyRows = [];
          let tbltbody = tbl.children[1];
          let tbltr = tbltbody.children;
          for (let kp = 0; kp < tbltr.length; kp++) {
            if (tbltr[kp].style.backgroundColor.toUpperCase() == 'gray'.toUpperCase())
              greyRows.push(tbltr[kp].outerHTML);
          }
          return greyRows;
        });
        let greydata = '';
        for (let g = 0; g < greyRecords.length; g++) {
          greydata = greydata + greyRecords[g];

        }
        fs.appendFile("grey.html", greydata, (err) => {
          if (err) {
            console.log(err);
          }
        });
        ///grey complete

        //test with rowrange*10
        for (let j = 0; j < (rowrangeopt.length * 10); j++) {

          let subresult = await page.evaluate(() => {
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

          if (subresult.length == 0) {
            console.log("......");
            break;
          }
          //selection

          var savebtnId = await subresult[0];
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
          var waitPageNav1 = page.waitForNavigation({ timeout: operationTimeout });
          let btnclick = await page.evaluate((btnId) => {
            let btn1 = document.getElementById(btnId);
            btn1.click();
          }, savebtnId);
          await delay(1000);
          await waitPageNav1;
          await delay(1000);
        }

      }


    }

  }
  catch (err) {
    console.log(err);
  }

})();