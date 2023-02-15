import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
import express from "express";
import {
  addAlchemyContextToRequest,
  validateAlchemySignature,
  AlchemyWebhookEvent,
} from "./webhooksUtil";

async function main(): Promise<void> {
  const app = express();

  const port = Number(process.env.PORT) || 8080;
	const host = process.env.HOST || '127.0.0.1';
	const signingKey = process.env.SIGNING_KEY || '';

  // Middleware needed to validate the alchemy signature
  app.use(
    express.json({
      verify: addAlchemyContextToRequest,
    })
  );
  app.use(validateAlchemySignature(signingKey));

  // Register handler for Alchemy Notify webhook events
  // TODO: update to your own webhook path
  app.post("/webhook-path", async (req, res) => {
    const webhookEvent = req.body as AlchemyWebhookEvent;

    if (webhookEvent.type !== "ADDRESS_ACTIVITY")
      return res.status(400).send("Only ADDRESS_ACTIVITY event type supported");

    const { Mailchain } = await import("@mailchain/sdk");
    const secretRecoveryPhrase = process.env.SECRET_RECOVERY_PHRASE!
    const mailchain = Mailchain.fromSecretRecoveryPhrase(secretRecoveryPhrase);

    for (const activity of webhookEvent.event.activity) {
      if (activity.category !== "external") continue;

      const { fromAddress, toAddress, value, asset, hash } = activity;
      const shortFromAddress = `${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`
      const shortToAddress = `${toAddress.slice(0, 6)}...${toAddress.slice(-4)}`

      const mailSubject = `Funds transfer from ${shortFromAddress} into ${shortToAddress}`;
      const mailContent = {
        text: `There has been a transfer of ${value}${asset} from ${fromAddress} into ${toAddress}. You can check the transaction details on https://goerli.etherscan.io/tx/${hash}.`,
        html: `There has been a transfer of <b>${value}${asset}</b> from <b>${fromAddress}</b> into <b>${toAddress}<b>. Check the transaction details on <a href="https://goerli.etherscan.io/tx/${hash}">Etherscan</a>.`,
      };

      await mailchain.sendMail({
        from: (await mailchain.user()).address,
        to: [
          `${fromAddress}@ethereum.mailchain.com`,
          `${toAddress}@ethereum.mailchain.com`,
        ],
        subject: mailSubject,
        content: mailContent,
      });
    }

    console.log(`Processing webhook event id: ${webhookEvent.id}`);
    // Be sure to respond with 200 when you successfully process the event
    return res.send("Alchemy Notify is the best!");
  });

  // Listen to Alchemy Notify webhook events
  app.listen(port, host, () => {
    console.log(`Example Alchemy Notify app listening at ${host}:${port}`);
  });
}

main();
