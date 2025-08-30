/* Insurance Booster javascript.
This code will reproduce features and functionality related to the benefits booster website.
Current scope is the census information to document functionality.
This will be replicated only on-screen for now to ensure math and information is correct and create a working model.
This work is completed by James Burdine.
*/


document.addEventListener("DOMContentLoaded", (event) => {
  const el = document.querySelector("#submitButton");
  if (el) {
    el.addEventListener("click", (event) => SubmitForm("B"));
  }
  const csv = document.querySelector("#ReadFromFileButton");
  if(csv){
    csv.addEventListener("click", (event) => VerifyCSV());
  }
});


function SubmitForm(source) {
  if(source == "B"){
    //Filing Status, should be catching
    if(document.getElementById("selectCustFileStatus").value != ""){
      var marriageStatus = document.getElementById("selectCustFileStatus").value;
    }
    else if (document.getElementById("selectCustFileStatus").value == ""){
      alert("Please choose a Marriage Filing Status.")
      return;
    }
    //make Pay Period a DDLB so there's no discrepancy, add other if semi-monthly is fucky
    var payPeriod = periodCheck(document.getElementById("payPeriodLength").value);
    //Pay per check
    if(document.getElementById("inputCustPayPerPeriod").value != ""){
      var payPerPeriod = document.getElementById("inputCustPayPerPeriod").value
    }
    else{
      alert("Please input the pay.")
      return;
    }
    var deductions = "0";
    if(document.getElementById("selectCustDeductions").value != "other" && document.getElementById("selectCustDeductions").value != ""){
      deductions = document.getElementById("selectCustDeductions").value;
    }
    else if(document.getElementById("selectCustDeductions")?.value == "other"){
      deductions = document.getElementById("inputCustDeductions").value;
    }
    else{
      deductions = "0";
    }
    var totalPay = payPeriod * payPerPeriod;
    var customerName = document.getElementById("inputCustName").value;  
    if(document.getElementById("selectCustState")?.value != ""){
      var custState = document.getElementById("selectCustState").value
    }
    else{
      alert("Please choose a State.")
      return;
    }
    var custDependents = document.getElementById("inputCustDependents").value ? document.getElementById("inputCustDependents").value : "0";
  }
  //need taxable income before finding tax rates
  var taxableIncome = parseInt(totalPay) - (parseInt(deductions) + (2000 * parseInt(custDependents)));
  
  //Filing Status, dependents, deductions
  var federalTaxesOwed = FederalTaxRateCalculate(
    taxableIncome,
    marriageStatus,
    custDependents
  );

  //calculate manually from js, use multiple functions for harder states
  var stateTaxRate = StateCalculate(taxableIncome, custState, marriageStatus);

  //Taxes by the Numbers
  var stateTaxesOwed = stateTaxRate * taxableIncome;
  if (custState == "SC" && marriageStatus == "M") {
    //Marriage exemption credit
    stateTaxesOwed = stateTaxesOwed - 210.5;
  }
  var ficaTaxesTotalOwed = 0.0765 * taxableIncome;
  if (custState == "NM" && taxableIncome > 200000) {
    ficaTaxesTotalOwed += 0.09 * taxableIncome;
  }
  var grossPay =
    totalPay - (ficaTaxesTotalOwed + stateTaxesOwed + federalTaxesOwed);
  var taxesTotal = ficaTaxesTotalOwed + stateTaxesOwed +federalTaxesOwed;
  //How much that should be boosted per month based on filing & dependents
  var benefitsBoosted = 0;
  if (marriageStatus == "S" && custDependents == 0) {
    benefitsBoosted = 900;
  } else if (
    (marriageStatus == "M" && custDependents == 0) ||
    (marriageStatus == "S" && custDependents >= 1)
  ) {
    benefitsBoosted = 1300;
  } else if (marriageStatus == "M" && custDependents >= 1) {
    benefitsBoosted = 1700;
  }

  var benefitsBoostedAnnual = benefitsBoosted * 12;
  var benefitedTaxableIncome = totalPay - benefitsBoostedAnnual;

  //Boosted Tax Rates
  var boostedFederalTaxesOwed = FederalTaxRateCalculate(
    benefitedTaxableIncome,
    marriageStatus
  );
  var boostedStateTaxRate = StateCalculate(
    benefitedTaxableIncome,
    custState,
    marriageStatus
  );

  //Taxes by the Numbers
  var boostedStateTaxesOwed = stateTaxRate * benefitedTaxableIncome;
  //Edge cases for state-specifics & non-tax rates
  if (custState == "SC" && marriageStatus == "M") {
    //Marriage exemption credit
    boostedStateTaxesOwed = boostedStateTaxesOwed - 210.5;
  }
  var boostedFicaTaxesTotalOwed = 0.0765 * benefitedTaxableIncome;
  if (custState == "NM" && benefitedTaxableIncome > 200000) {
    boostedFicaTaxesTotalOwed += 0.09 * benefitedTaxableIncome;
  }
  var boostedTotalTaxes = boostedFederalTaxesOwed + boostedFicaTaxesTotalOwed + boostedStateTaxesOwed;
  var boostedGrossPay =
    benefitedTaxableIncome -
    (boostedFederalTaxesOwed +
      boostedStateTaxesOwed +
      boostedFicaTaxesTotalOwed);
  var boostedPerPay = benefitsBoostedAnnual / payPeriod;
  //use advBenRadio here now
  var advBenRadio = document.getElementById("advBenRadio10").checked ? document.getElementById("advBenRadio10").value : document.getElementById("advBenRadio5").value;
  var advBenRatio = 1- (advBenRadio* 1/100);
  var boostedPlanDistribution = boostedPerPay * advBenRatio;
  var boostedTakeHomePay = boostedGrossPay + boostedPlanDistribution;

  var marriageStatusText = document.getElementById("selectCustFileStatus").options[document.getElementById("selectCustFileStatus").options.selectedIndex].innerHTML;
  
  var currentDay = new Date().getDate();
  var currentMonth = (new Date().getMonth()+1);
  var currentYear = new Date().getFullYear();

  var docDefinition = {
    info: {
      title: `${customerName}_${currentMonth}_${currentDay}_${currentYear}`
  },
    content: [
      {text: "Benefits Boosting!", style:['header', 'center']},
      `Customer Name: ${customerName}`,
      `Annual Salary: $${totalPay}`,
      `Tax Year: 2025`,
      `Pay Period: $${payPerPeriod}`,
      `Filing Status: ${marriageStatusText}`,
      `Dependents: ${custDependents}`,
      `Date: ${currentMonth}/${currentDay}/${currentYear}`,
      {text:"Paycheck Comparison", style:['header', 'center']},
      {
        style: 'tableExample',
        table: {
          body: [
            ['Paycheck Breakdown', '', ''],
            ['', 'Current', 'BB'],
            ['Gross Pay', {text:`$${parseFloat(payPerPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${parseFloat(payPerPeriod).toFixed(2)}`, style:{alignment: 'right'}}],
            ['BB Plan Contribution',{text:'$0.00', style:{alignment: 'right'}},{text:`$${(boostedPerPay).toFixed(2)}`, style:{alignment: 'right'}}],
            ['Taxable income',{text:`$${(taxableIncome/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${(benefitedTaxableIncome/payPeriod).toFixed(2)}`, style:{alignment: 'right'}}],
            ['Federal Withholding',{text:`$${(federalTaxesOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${(boostedFederalTaxesOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}}],
            ['State Withholding',{text:`$${(stateTaxesOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${(boostedStateTaxesOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}}],
            ['FICA Taxes',{text:`$${(ficaTaxesTotalOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${(boostedFicaTaxesTotalOwed/payPeriod).toFixed(2)}`, style:{alignment: 'right'}}],
            ['Pay (Net of taxes)',{text:`$${(parseFloat(taxableIncome/payPeriod) - taxesTotal/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${((benefitedTaxableIncome/payPeriod)-(boostedTotalTaxes/payPeriod)).toFixed(2)}`, style:{alignment: 'right'}}],
            ['Plan Distribution',{text:`$0.00`, style:{alignment: 'right'}},{text:`$${parseFloat(boostedPlanDistribution).toFixed(2)}`, style:{alignment: 'right'}}],
            ['Net Pay',{text:`$${(grossPay/payPeriod).toFixed(2)}`, style:{alignment: 'right'}},{text:`$${(((benefitedTaxableIncome/payPeriod)-(boostedTotalTaxes/payPeriod)) + boostedPlanDistribution).toFixed(2)}`, style:{alignment: 'right'}}]
          ]
        }      
      },
      `New Employee Benefit Allotment: $${(((benefitedTaxableIncome/payPeriod -(boostedTotalTaxes/payPeriod)) + boostedPlanDistribution) - (grossPay/payPeriod)).toFixed(2)}`
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true
      },
      center:{
        alignment:'center'
      },
      anotherStyle: {
        italics: true,
        alignment: 'right'
      },
      tableExample:{
        alignment:'right'
      }
    },
    defaultStyle: { font: "Roboto" },
  };


  PrintDocument(docDefinition);
  
  
  console.log("We tried and this is the thanks we get?");
  //Right now display info to front-end, then write to file using
  return 0;
}

//Add state tax rate based on which states have them
function StateCalculate(taxableIncome, custState, marriageStatus) {
  //Texas & Florida has none, starting with 0 on this and changing it if there is one
  var stateTaxRate = 0;
  if (custState == "GA") {
    if (marriageStatus == "S" || marriageStatus == "F") {
      if (taxableIncome > 12000) {
        stateTaxRate = 0.0539;
      } else {
        stateTaxRate = 0;
      }
    } else if (
      marriageStatus == "M" ||
      marriageStatus == "H" ||
      marriageStatus == "W"
    ) {
      if (taxableIncome > 24000) {
        stateTaxRate = 0.0539;
      } else {
        stateTaxRate = 0;
      }
    }
  }
  if (custState == "OH") {
    if (taxableIncome <= 26050) {
      stateTaxRate = 0;
    } else if (taxableIncome > 26050 && taxableIncome <= 100000) {
      stateTaxRate = 0.0275;
    } else if (taxableIncome > 100000) {
      stateTaxRate = 0.035;
    } else {
      stateTaxRate = 0;
    }
  }
  if (custState == "CO") {
    stateTaxRate = 0.044;
  }
  if (custState == "OK") {
    if (marriageStatus == "S" || marriageStatus == "F") {
      taxableIncome = taxableIncome - 1000;
      if (taxableIncome <= 1000) {
        stateTaxRate = 0;
      } else if (taxableIncome > 1000 && taxableIncome <= 2500) {
        stateTaxRate = 0.0075;
      } else if (taxableIncome > 2500 && taxableIncome <= 3750) {
        stateTaxRate = 0.0175;
      } else if (taxableIncome > 3750 && taxableIncome <= 4900) {
        stateTaxRate = 0.0275;
      } else if (taxableIncome > 4900 && taxableIncome <= 7200) {
        stateTaxRate = 0.0375;
      } else if (taxableIncome > 7200) {
        stateTaxRate = 0.0475;
      }
    } else if (
      marriageStatus == "M" ||
      marriageStatus == "H" ||
      marriageStatus == "W"
    ) {
      taxableIncome = taxableIncome - 2000;
      if (taxableIncome <= 2000) {
        stateTaxRate = 0;
      } else if (taxableIncome > 2000 && taxableIncome <= 5000) {
        stateTaxRate = 0.0075;
      } else if (taxableIncome > 5000 && taxableIncome <= 7500) {
        stateTaxRate = 0.0175;
      } else if (taxableIncome > 7500 && taxableIncome <= 9800) {
        stateTaxRate = 0.0275;
      } else if (taxableIncome > 9800 && taxableIncome <= 14400) {
        stateTaxRate = 0.0375;
      } else if (taxableIncome > 14400) {
        stateTaxRate = 0.0475;
      }
    }
  }
  if (custState == "SC") {
    if (marriageStatus == "S" || marriageStatus == "F") {
      if (taxableIncome <= 20000) {
        stateTaxRate = 0.02;
      } else if (taxableIncome > 20000 && taxableIncome <= 30000) {
        stateTaxRate = 0.03;
      } else if (taxableIncome > 30000 && taxableIncome <= 40000) {
        stateTaxRate = 0.04;
      } else if (taxableIncome > 40000 && taxableIncome <= 50000) {
        stateTaxRate = 0.05;
      }
    }
  }
  if (custState == "NM") {
    if (taxableIncome < 5500) {
      stateTaxRate = 0.015;
    }
    if (taxableIncome > 5500 && taxableIncome <= 16500) {
      stateTaxRate = 0.032;
    }
    if (taxableIncome > 16500 && taxableIncome <= 33500) {
      stateTaxRate = 0.043;
    }
    if (taxableIncome > 33500 && taxableIncome <= 66500) {
      stateTaxRate = 0.047;
    }
    if (taxableIncome > 66500 && taxableIncome <= 66500) {
      stateTaxRate = 0.049;
    }
  }
  return stateTaxRate;
}

function periodCheck(value) {
  if (value == 0 && document.getElementById("inputCustomPayPeriod").value != "") {
    value = document.getElementById("inputCustomPayPeriod").value;
  }
  else{
    alert("Please input a pay period.");
    return;
  }
  return value;
}

function FederalTaxRateCalculate(taxableIncome, marriageStatus) {
  var previousBracket = 0;
  var combinedTaxes = 0;
  //Single Filing
  if (marriageStatus == "S") {
    if (taxableIncome < 11600) {
      combinedTaxes = taxableIncome * 0.1;
      return combinedTaxes;
    }
    if (taxableIncome < 47150) {
      previousBracket = 11600 * 0.1;
      combinedTaxes = previousBracket + (taxableIncome - 11600) * 0.12;
      return combinedTaxes;
    }
    if (taxableIncome < 100525) {
      previousBracket = 11600 * 0.1 + 47150 * 0.12;
      combinedTaxes = previousBracket + (taxableIncome - 47150) * 0.22;
      return combinedTaxes;
    }
    if (taxableIncome < 191950) {
      previousBracket = 11600 * 0.1 + 47150 * 0.12 + 100525 * 0.22;
      combinedTaxes = previousBracket + (taxableIncome - 100525) * 0.24;
      return combinedTaxes;
    }
    if (taxableIncome < 243725) {
      previousBracket =
        11600 * 0.1 + 47150 * 0.12 + 100525 * 0.22 + 191950 * 0.24;
      combinedTaxes = previousBracket + (taxableIncome - 191950) * 0.32;
      return combinedTaxes;
    }
    if (taxableIncome < 609350) {
      previousBracket =
        11600 * 0.1 +
        47150 * 0.12 +
        100525 * 0.22 +
        191950 * 0.24 +
        243725 * 0.32;
      combinedTaxes = previousBracket + (taxableIncome - 243725) * 0.35;
      return combinedTaxes;
    }
    if (taxableIncome > 609350) {
      previousBracket =
        11600 * 0.1 +
        47150 * 0.12 +
        100525 * 0.22 +
        191950 * 0.24 +
        243725 * 0.32 +
        609350 * 0.35;
      combinedTaxes = previousBracket + (taxableIncome - 609350) * 0.37;
      return combinedTaxes;
    }
  }
  //Married Filing Jointly or Widowed
  if (marriageStatus == "M" || marriageStatus == "W") {
    if (taxableIncome < 23200) {
      combinedTaxes = taxableIncome * 0.1;
      return combinedTaxes;
    }
    if (taxableIncome < 94300) {
      previousBracket = 23200 * 0.1;
      combinedTaxes = previousBracket + (taxableIncome - 23200) * 0.12;
      return combinedTaxes;
    }
    if (taxableIncome < 201050) {
      previousBracket = 23200 * 0.1 + 94300 * 0.12;
      combinedTaxes = previousBracket + (taxableIncome - 94300) * 0.22;
      return combinedTaxes;
    }
    if (taxableIncome < 383900) {
      previousBracket = 23200 * 0.1 + 94300 * 0.12 + 100525 * 0.22;
      combinedTaxes = previousBracket + (taxableIncome - 201050) * 0.24;
      return combinedTaxes;
    }
    if (taxableIncome < 487500) {
      previousBracket =
        23200 * 0.1 + 94300 * 0.12 + 100525 * 0.22 + 383900 * 0.24;
      combinedTaxes = previousBracket + (taxableIncome - 383900) * 0.32;
      return combinedTaxes;
    }
    if (taxableIncome < 731200) {
      previousBracket =
        23200 * 0.1 +
        94300 * 0.12 +
        100525 * 0.22 +
        383900 *  0.24 +
        487500 * 0.32;
      combinedTaxes = previousBracket + (taxableIncome - 487500) * 0.35;
      return combinedTaxes;
    }
    if (taxableIncome > 731200) {
      previousBracket =
        23200 * 0.1 +
        94300 * 0.12 +
        100525 * 0.22 +
        383900 * 0.24 +
        487500 * 0.32 +
        731200 * 0.35;
      combinedTaxes = previousBracket + (taxableIncome - 731200) * 0.37;
      return combinedTaxes;
    }
  }
  //Married Filing Separately
  if (marriageStatus == "F") {
    if (taxableIncome < 11600) {
      combinedTaxes = taxableIncome * 0.1;
      return combinedTaxes;
    }
    if (taxableIncome < 47150) {
      previousBracket = 11600 * 0.1;
      combinedTaxes = previousBracket + (taxableIncome - 11600) * 0.12;
      return combinedTaxes;
    }
    if (taxableIncome < 100525) {
      previousBracket = 11600 * 0.1 + 47150 * 0.12;
      combinedTaxes = previousBracket + (taxableIncome - 47150) * 0.22;
      return combinedTaxes;
    }
    if (taxableIncome < 191950) {
      previousBracket = 11600 * 0.1 + 47150 * 0.12 + 100525 * 0.22;
      combinedTaxes = previousBracket + (taxableIncome - 100525) * 0.24;
      return combinedTaxes;
    }
    if (taxableIncome < 243725) {
      previousBracket =
        11600 * 0.1 + 47150 * 0.12 + 100525 * 0.22 + 191950 * 0.24;
      combinedTaxes = previousBracket + (taxableIncome - 191950) * 0.32;
      return combinedTaxes;
    }
    if (taxableIncome < 365500) {
      previousBracket =
        11600 * 0.1 +
        47150 * 0.12 +
        100525 * 0.22 +
        191950 * 0.24 +
        243725 * 0.32;
      combinedTaxes = previousBracket + (taxableIncome - 243725) * 0.35;
      return combinedTaxes;
    }
    if (taxableIncome > 365500) {
      previousBracket =
        11600 * 0.1 +
        47150 * 0.12 +
        100525 * 0.22 +
        191950 * 0.24 +
        243725 * 0.32 +
        365500 * 0.35;
      combinedTaxes = previousBracket + (taxableIncome - 365500) * 0.37;
      return combinedTaxes;
    }
  }
  //Head of Household
  if (marriageStatus == "H") {
    if (taxableIncome < 16550) {
      combinedTaxes = taxableIncome * 0.1;
      return combinedTaxes;
    }
    if (taxableIncome < 63100) {
      previousBracket = 16550 * 0.1;
      combinedTaxes = previousBracket + (taxableIncome - 16550) * 0.12;
      return combinedTaxes;
    }
    if (taxableIncome < 100500) {
      previousBracket = 16550 * 0.1 + 63100 * 0.12;
      combinedTaxes = previousBracket + (taxableIncome - 63100) * 0.22;
      return combinedTaxes;
    }
    if (taxableIncome < 191950) {
      previousBracket = 16550 * 0.1 + 63100 * 0.12 + 100500 * 0.22;
      combinedTaxes = previousBracket + (taxableIncome - 100500) * 0.24;
      return combinedTaxes;
    }
    if (taxableIncome < 243700) {
      previousBracket =
        16550 * 0.1 + 63100 * 0.12 + 100500 * 0.22 + 191950 * 0.24;
      combinedTaxes = previousBracket + (taxableIncome - 191950) * 0.32;
      return combinedTaxes;
    }
    if (taxableIncome < 609350) {
      previousBracket =
        16550 * 0.1 +
        63100 * 0.12 +
        100500 * 0.22 +
        191950 * 0.24 +
        243700 * 0.32;
      combinedTaxes = previousBracket + (taxableIncome - 243700) * 0.35;
      return combinedTaxes;
    }
    if (taxableIncome > 609350) {
      previousBracket =
        16550 * 0.1 +
        63100 * 0.12 +
        100500 * 0.22 +
        191950 * 0.24 +
        243700 * 0.32 +
        609350 * 0.35;
      combinedTaxes = previousBracket + (taxableIncome - 609350) * 0.37;
      return combinedTaxes;
    }
  }
}

function VerifyCSV(){
  //Use Papa csv to read in contents and parse. Then, loop through a copy of SubmitForm

}