$(document).ready(function(){
  //pym stuff
  var pymChild = new pym.Child();

  //initialize floatlabeljs
  $( '.js-float-label-wrapper' ).FloatLabel();

  $('#calculate').click(function(e){
    var years_exp = 0;

    var inp_str = ["state_mo", "local_mo", "other_mo"]
    var incomes = {
      "state_mo": 0,
      "local_mo": 0,
      "other_mo": 0
    }

    var principal_performance = {
      1415: 0,
      1516: 0,
      1718: 0
    }

    /*** INCOME ***/
    for (i in inp_str){
      //check if no input
      if ($('#' + inp_str[i]).val() === $('[for=' + inp_str[i] + ']').html()){
        //income validation - *required
        if (inp_str[i] == "state_mo"){
          alert("Please enter your state income");
        }
      } else { //if valid input, set it
        incomes[inp_str[i]] = $('#' + inp_str[i]).val();
      }
    }

    /*** YEARS EXPERIENCE ***/
    //check if no input
    if ($('#years_exp').val() === $('[for=years_exp]').html()){
      alert("Please enter your years of experience.");
    } else { //if valid input, set it
      years_exp = $('#years_exp').val();
    }

    // console.log(getEstimatedAnnualCompensation(parseInt(incomes["local_mo"]),
    // parseInt(incomes["state_mo"]), parseInt(incomes["other_mo"]), parseInt(years_exp)));


  })


/**** FORM VALIDATION ****/

// https://webdesign.tutsplus.com/tutorials/auto-formatting-input-value--cms-26745
const FORM = $('#form');
const INPUT = $(FORM).find("input");

$(INPUT).on("keyup", function(e){

    var selection = window.getSelection().toString();
    if ( selection !== '' ) {
        return;
    }

    if ( $.inArray( event.keyCode, [38,40,37,39] ) !== -1 ) {
        return;
    }

    var $this = $(this);
    var input = $this.val();

    var input = input.replace(/[\D\s\._\-]+/g, "");
    input = input ? parseInt(input, 10) : 0;

    $this.val(function(){
      return (input === 0) ? "" : input.toLocaleString("en-US");

  });


})



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

  //EXAMPLE
  var principal_performance = {
    1415: 0,
    1516: 0,
    1718: 0
  }
  var state_mo = 5113;
  var local_mo = 700;
  var other_mo = 661;
  var years_exp = 20;
  var adm = 2;
  principal_performance[1415] = 3;
  principal_performance[1516] = 2;
  principal_performance[1617] = 2;

  console.log(getEstimatedAnnualCompensation(local_mo, state_mo, other_mo, years_exp, principal_performance, adm));

  function getEstimatedAnnualCompensation(local_mo, state_mo, other_mo, years_exp, principal_performance, adm){
    var adm_num = getADMNum(adm);
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
    return est_state_annual+local_annual+other_annual+state_hold_harmless;
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



  function getADMNum(adm){

    if (adm >= 0 && adm <= 400){
      return 1;
    } else if (adm >= 401 && adm <= 700){
      return 2;
    } else if (adm >= 701 && adm <= 1000){
      return 3;
    } else if (adm >= 1001 && adm <= 1300){
      return 4;
    } else {
      return 5;
    }

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
      if (didntLeadCounter == 2 || notMetCounter == 2){
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
