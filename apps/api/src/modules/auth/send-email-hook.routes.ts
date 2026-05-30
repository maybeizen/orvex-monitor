import { Router, raw } from "express";

import { handleSendEmailHook } from "./send-email-hook.controller";

export const sendEmailHookRouter = Router();

sendEmailHookRouter.post(
  "/send-email",
  raw({ type: "application/json" }),
  (req, res) => {
    void handleSendEmailHook(req, res);
  },
);
