
// Rx is submitted
// if(RxSubmitted) {
//   // HAS:
//   // prescriptionId
//   // prescriptionNumber
//   // prescriptionSubmittedDate
// }
// else { //Rx is NEW and not submitted
//   if()
//
// }


I. Not Submitted
  A. Lab - appDemo2 Guide / appDemo2 Guides
    1. Guides Selected (up to 4)
      a. Show Guide Shipping Options

  B. Lab - External Lab / Appliance
    1. No Free Guide Selected
      a. Hide Guide Shipping Options
    2. Free Guide Selected
      a. Show Guide Shipping Options
      b. Show Submit Button


II. Submitted
  A. Lab - appDemo2 Guide / appDemo2 Guides [no changes allowed]
    1. Guides Selected (orderId = 1) [cannot add any new guides, even if less than 4]

  B. Lab - External Lab / Status : Design Review [can no longer select appDemo2 Labs, but can select another lab]
    1. No Free Guide Selected (orderId = 0)
    2. Free Guide Selected Previously & Paid (orderId = 1) [cannot change free appDemo2 guide or shipping]
        a. Hide Guide Shipping Options
        b. Hide Submit Button
        c. Hide Guide Selection
    3. Free Guide Newly Selected & Not Paid (orderId = 0)
        a. Show Guide Shipping Options
        b. Show Submit Button

  C. Lab - External Lab / Status : In Fabrication [no changes allowed]


  // Possible Conditions
  // 1. New Rx - not Submitted
  // 2. New Rx - appDemo2 Guide Lab selected / appDemo2 Guide Appliances (up to 4)
  // 3. New Rx - External Lab selected / No appDemo2 Guide Appliance selected
  // 4. New Rx - External Lab selected / 1 (free) appDemo2 Guide Appliance [appDemo2GuideForUpperSystem] selected
  // 5. Submitted Rx - appDemo2 Guide Lab selected / appDemo2 Guide shipping + Appliances paid for
  // 6. Submitted Rx - External Lab /

// Critical Options depending on status
  1. Lab
  2. Production Time
  3. Appliance
