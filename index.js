const XLSX = require('XLSX');
const request = require('request-promise');
const fs = require('fs')

let setupList = [],
    failed = [];

const fetchAccountInfo = accountNo => {

}

const getAccountName = (accountObj) => {
    let name = '';
    if (accountObj.firstName) {
        name += accountObj.firstName;
    }
    if (accountObj.middleName) {
        name += ` ${accountObj.middleName}`;
    }
    if (accountObj.lastName) {
        name += ` ${accountObj.lastName}`;
    }
    return name;
}

const createSetup = async(accountNumber, email) => {
    const setup = setupList.find(setup => setup.accountNo === accountNumber);
    if (setup !== undefined) {
        console.log(accountNumber, "skipped");
        setup.emails.push(email);
        return;
    }
    const { hostHeaderInfo, customerInfo } = await request.get('https://citmobile.stanbicbank.com.gh/AccountServices/accounts/customeraccount', {
        qs: { accountNumber },
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Tye, Accept, Authorization',
            'sourceCode': 'credit',
            'countryCode': 'GH'
        },
        json: true,
    });
    console.log(accountNumber, hostHeaderInfo);
    if (hostHeaderInfo.responseCode !== '000') throw hostHeaderInfo.responseMessage;
    const name = getAccountName(customerInfo);
    setupList.push({
        createdDate: new Date(),
        createdBy: 'C809610',
        accountNo: accountNumber,
        accountName: name,
        salutation: name,
        segment: customerInfo.segmentation,
        requestType: 'BOTH',
        emails: [email],
    });
}

const sleep = async(timeout) => {
    return new Promise(resolve => {
        setTimeout(() => resolve, timeout);
    })
}

const main = async() => {
    let workbook = XLSX.readFile('requests.xlsx'),
        sheet_name_list = workbook.SheetNames;
    for (const y of sheet_name_list) {
        let json = XLSX.utils.sheet_to_json(workbook.Sheets[y], { defval: "", header: 1 });
        console.log(json);
        for (const j of json) {
            try {
                await createSetup(j[0].toString().replace(/[^\d]/, ''), j[1].trim())
            } catch (e) {
                failed.push({ data: [j[0], j[1]], sheet: y })
                console.log(e);
            }
            sleep(500)
        }
    }
    console.log("Saving");
    fs.writeFileSync('success2.json', JSON.stringify(setupList, undefined, 4));
    fs.writeFileSync('failed2.json', JSON.stringify(failed, undefined, 4));
}

try {
    console.log("Starting");
    main();
} catch (error) {
    fs.writeFileSync('success2.json', JSON.stringify(setupList, undefined, 4));
    fs.writeFileSync('failed2.json', JSON.stringify(failed, undefined, 4));
}