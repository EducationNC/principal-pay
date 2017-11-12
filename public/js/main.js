$(document).ready(function(){
  //pym stuff
  var pymChild = new pym.Child();

  //helper functions (FOR THIS FILE ONLY)
  function formatInput(x){
     return "$" + x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  /***** SALARY CALCULATIONS *****/

    const PERFORMANCE_NAME = {
      1: "Exceeded",
      2: "Met",
      3: "Not Met",
      4: "Ineligible",
      5: "Didn't Lead"
    }

    const ADM_KEY = {
      1: "0-400",
      2: "401-700",
      3: "701-1000",
      4: "1001-1300",
      5: "1301+"
    }
    const TEACHER_SCORE_TO_PAY_KEY = {
      "B1":	61751,
      "B2":	64839,
      "B3":	67926,
      "B4":	71014,
      "B5":	74101,
      "G1":	67926,
      "G2":	71322,
      "G3":	74719,
      "G4":	78115,
      "G5":	81511,
      "E1":	74101,
      "E2":	77806,
      "E3":	81511,
      "E4":	85216,
      "E5":	88921
    }


  startMeUp()

function startMeUp(){
  var income_inp_str = ["state_mo", "local_mo", "other_mo"]
  var incomes = {
    "state_mo": 0,
    "local_mo": 0,
    "other_mo": 0
  }
  var perf_inp_str = ["1415", "1516", "1617"]
  var principal_performance = {
    1415: 0,
    1516: 0,
    1617: 0
  }
  var years_exp = $('#years_exp').val();
  var adm = $('#adm').val();

  /*** INCOME ***/
  for (i in income_inp_str){
      incomes[income_inp_str[i]] = $('#' + income_inp_str[i]).val();
    }

  for (i in perf_inp_str){
      principal_performance[parseFloat(perf_inp_str[i])] = parseFloat($('#' + perf_inp_str[i]).val());
    }

  getEstimatedAnnualCompensation(parseFloat(incomes["local_mo"].replace(",","")),
  parseFloat(incomes["state_mo"].replace(",","")), parseFloat(incomes["other_mo"].replace(",","")), parseFloat(years_exp), principal_performance, adm);


  //get from the sliders
  $('.output-trigger').change(function(){

    var income_inp_str = ["state_mo", "local_mo", "other_mo"]
    var incomes = {
      "state_mo": 0,
      "local_mo": 0,
      "other_mo": 0
    }
    var perf_inp_str = ["1415", "1516", "1617"]
    var principal_performance = {
      1415: 0,
      1516: 0,
      1617: 0
    }
    var years_exp = $('#years_exp').val();
    var adm = $('#adm').val();

    /*** INCOME ***/
    for (i in income_inp_str){
        incomes[income_inp_str[i]] = $('#' + income_inp_str[i]).val();
      }

    for (i in perf_inp_str){
        principal_performance[parseFloat(perf_inp_str[i])] = parseFloat($('#' + perf_inp_str[i]).val());
      }

      //debugger
    getEstimatedAnnualCompensation(parseFloat(incomes["local_mo"].replace(",","")),
    parseFloat(incomes["state_mo"].replace(",","")), parseFloat(incomes["other_mo"].replace(",","")), parseFloat(years_exp), principal_performance, adm);

    });
  }

function updateResults(state, local, other, state_hold_harmless){

  var total = state+local+other+state_hold_harmless;

  //debugger

  $('#result_total').html(formatInput(total));
  $('#result_local').html(formatInput(local));
  $('#result_state').html(formatInput(state));
  $('#result_statehold').html(formatInput(state_hold_harmless));
  $('#result_other').html(formatInput(other));
}


  function getEstimatedAnnualCompensation(local_mo, state_mo, other_mo, years_exp, principal_performance, adm_num){
    var performance_letter = getPerformanceLetter(principal_performance);
    var teacher_score = getTeacherScore(adm_num, performance_letter);

    //estimations are different or calculated from inputs
    var est_state_annual = TEACHER_SCORE_TO_PAY_KEY[teacher_score];
    var est_longevity = getLongevity(years_exp, state_mo);

    //estimations are the same as inputs
    var local_annual = Math.round(local_mo*12);
    var other_annual = Math.round(other_mo*12);
    var state_annual = Math.round(state_mo*12);

    //state hold harmless calc
    var state_hold_harmless = 0;
    if (est_state_annual < (state_annual + est_longevity)){
      state_hold_harmless = state_annual + est_longevity - est_state_annual;
    }

    //return the total annual compensation
    //return est_state_annual+local_annual+other_annual+state_hold_harmless;
    updateResults(est_state_annual, local_annual, other_annual, state_hold_harmless)
  }

  function getTotalSalary(local_mo, state_mo, other_mo){
    return local_mo + state_mo + other_mo;
  }

  function getLongevity(years_exp, state_mo){
    var est_longevity;

    if (years_exp >= 10 && years_exp < 15){
      est_longevity = .015;
    } else if (years_exp >= 15 && years_exp < 20){
      est_longevity = .0225;
    } else if (years_exp >= 20 && years_exp < 25){
      est_longevity = .0325;
    } else if (years_exp >= 25){
      est_longevity = .045;
    }

    return Math.round(est_longevity*12*state_mo);
  }

  function getPerformanceLetter(principal_performance){

    var exceededCounter = 0, metCounter = 0, notMetCounter = 0, ineligibleCounter = 0, didntLeadCounter = 0;

      for (i in principal_performance){
        switch(principal_performance[i]){
          case 1:
            exceededCounter++;
            break;
          case 2:
            metCounter++;
            break;
          case 3:
            notMetCounter++;
            break;
          case 4:
            ineligibleCounter++;
            break;
          case 5:
            didntLeadCounter++;
            break;
        }
      }

      //Principal has not supervised a school for 2 of the last 3 years
      //Not Met at least 2 of the last 3
      if (didntLeadCounter == 2 || notMetCounter >= 2){
        return "B";
      }
      //Met + Met + NotMet/Exceeded
      if (metCounter == 2 && (notMetCounter == 1 || exceededCounter == 1)){
        return "G";
      }
      //Principal for 2 of the last 3 years of a school not eligible to receive a school growth score
      if (ineligibleCounter == 2){
        return "G";
      }
      //Exceeded + Met + Not Met
      if (exceededCounter == 1 && metCounter == 1 && notMetCounter == 1){
        return "G";
      }
      //Exceeded + Exceeded + Not Met/Met/Exceeded
      if (exceededCounter == 2 && (notMetCounter == 1 || metCounter == 1 || exceededCounter == 1)){
        return "E";
      }

  }

  function getTeacherScore(adm_num, performance_letter){
    return "" + performance_letter + adm_num;
  }

});
