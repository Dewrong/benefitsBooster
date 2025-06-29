/* Insurance Booster javascript.
This code will reproduce features and functionality related to the benefits booster website.
Current scope is the census information to document functionality.
This will be replicated only on-screen for now to ensure math and information is correct and create a working model.
This work is completed by James Burdine.
*/

window.addEventListener("DOMContentLoaded", (event) => {
  const el = document.querySelector("#submitButton");
  if (el) {
    el.addEventListener("click", (event) => SubmitForm());
  }
});

function SubmitForm() {
  
  var marriageStatus = document.getElementById("selectCustFileStatus").value;
  //make Pay Period a DDLB so there's no discrepancy, add other if semi-monthly is fucky
  var payPeriod = periodCheck(document.getElementById("payPeriodLength").value);
  var payPerPeriod = document.getElementById("inputCustPayPerPeriod").value;
  var totalPay = payPeriod * payPerPeriod;
  var customerName = document.getElementById("inputCustName").value;
  //State will be updated to not be an input, or error check it and translate it to API's want
  var custState = StateTranslate(
    document.getElementById("inputCustState").value
  );
  var custDependents = document.getElementById("inputCustDependents").value;
  
  //FETCH HERE, CATCH HERE TOO
  var apiLink =
    "https://api.api-ninjas.com/v1/incometaxcalculator?country=US&region=" +
    custState +
    "&income=" +
    totalPay +
    "&filing_status=" +
    marriageStatus;
    taxAPICall(apiLink);
  //This is where we'd API call for the real tax filing %
  //Call API here to get the real value, 5.2% for example
  var taxRate = 0.052; //From API
  var federalTaxesOwed = 300;
  var stateTaxes = 3000;
  var federalTaxesOwed = 1000; //Also from API
  var ficaTaxesTotalOwed = 100; //Also from API!!

  var grossPay =
    totalPay - (ficaTaxesTotalOwed + stateTaxes + federalTaxesOwed);

  document.getElementById("putResultsHere").value = grossPay;
  console.log("This function still goes here!");
  //Right now display info to front-end, then write to file
  return 0;
}

function StateTranslate(state) {
  //There's probably a different API that'll translate this for me, for now we're just always returning TX

  //Fetch here, we won't have an actual default to TX in real code. Error code instead.
  //Don't you dare if-statement each state manually
  stateCode = "TX";

  return stateCode;
}

function periodCheck(value) {
  if (value == 0) {
    value = document.getElementById("inputCustomPayPeriod").value;
  }
  return value;
}

function showOtherPayPeriod() {
  document.getElementById("customPayPeriod").removeProperty("style");
}

function hideOtherPayPeriod() {
  document.getElementById("customPayPeriod").style.display = "none";
}

async function taxAPICall(apiLink) {
  // async function getText(file) {
  //     let myObject = await fetch(file);
  //     let myText = await myObject.text();
  //   myDisplay(myText);
  //   }
  let myObject = await fetch(apiLink);
  let myText = await myObject.text();
}
