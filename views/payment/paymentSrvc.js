app.factory('paymentFormSrvc', function(){
  return {
      onDemandMethodTypeId: 0,
      cardType: '',
      CreditCardNumber: '',
      SecurityCode: '',
      cardExpirationMonth: 0,
      cardExpirationYear: 0,
      cardName: '',
      saveCardToAccount: 0,
      cardOndemandmethodid: 0
   };
});
