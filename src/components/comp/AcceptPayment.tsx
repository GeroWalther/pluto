"use client";
import { CardElement, Elements } from "@stripe/react-stripe-js";
import {
  StripeCardElementOptions,
  StripeElement,
  StripeElements,
  loadStripe,
} from "@stripe/stripe-js";
import { FC, use, useEffect, useState } from "react";
import Stripe from "stripe";
import MaxWidthWrapper from "./MaxWidthWrapper";

interface AcceptPaymentProps {
  client_secret: string;
}

const AcceptPayment: FC<AcceptPaymentProps> = ({ client_secret }) => {
  return <MaxWidthWrapper>client_secret</MaxWidthWrapper>;
};

export default AcceptPayment;
