import {
  RESERVED_USERNAME_MESSAGE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  isReservedUsername,
} from "@orvex/types";
import { z } from "zod";

const usernameBase = z
  .string()
  .min(USERNAME_MIN_LENGTH)
  .max(USERNAME_MAX_LENGTH)
  .regex(USERNAME_PATTERN, "Username can only contain letters, numbers, and underscores");

export const usernameFieldSchema = usernameBase.refine(
  (value) => !isReservedUsername(value),
  { message: RESERVED_USERNAME_MESSAGE },
);
