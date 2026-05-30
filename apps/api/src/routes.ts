import { Router } from "express";

import { accountRouter } from "./modules/account/account.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { organizationsRouter } from "./modules/organizations/organizations.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/organizations", organizationsRouter);
