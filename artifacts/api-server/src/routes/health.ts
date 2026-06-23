import { Router, type IRouter } from "express";
import { isWhatsAppConfigured } from "../lib/whatsapp";
import { isEmailConfigured } from "../lib/email";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    automations: {
      email: isEmailConfigured(),
      whatsapp: isWhatsAppConfigured(),
      adminWhatsapp: Boolean(process.env.ADMIN_WHATSAPP_NUMBER),
    },
  });
});

export default router;
