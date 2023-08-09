const axios = require("axios")

const sendSms = async (otp, number, templateId) => {
//  options of fast2sms
  const options = {
    route: "dlt",
    sender_id: "MYRATI",
    message: templateId,
    variables_values: otp,
    flash: 0,
    numbers: number,
  };
//   send the otp with axios
  return await axios({
    method: 'post', //you can set what request you want to be
    url: "https://www.fast2sms.com/dev/bulkV2",
    data: options,
    headers: {
        "authorization":"TRgCZ4cfevoHqQ506maNP7nKhyw9sDGL2V1ujISbi3rtlMWYpJN2DQYdMPiqhVoyBnE6CeaW8uGUIvlr",
        "Content-Type":"application/json"
    }
  })

};

module.exports = sendSms;
