async function loadPaymentConfig() {
  const response = await fetch('/assets/payment/config.json');
  return response.json();
}

window.RaykelsPayment = {
  loadPaymentConfig
};
