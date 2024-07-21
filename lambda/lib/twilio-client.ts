import twilio from "twilio";

export class TwilioClient {
  private client: twilio.Twilio;
  private myPhoneNumber: string;

  constructor(accountSid: string, authToken: string, myPhoneNumber: string) {
    this.client = twilio(accountSid, authToken);
    this.myPhoneNumber = myPhoneNumber;
  }

  async makeCall(to: string, text: string): Promise<void> {
    await this.client.calls
      .create({
        to,
        from: this.myPhoneNumber,
        twiml: `<Response><Say>${text}</Say></Response>`,
      })
      .then((call) => {
        console.log(call);
      })
      .catch((err) => {
        console.error(err);
        throw new Error("Failed to make a call");
      });

    return;
  }
}
