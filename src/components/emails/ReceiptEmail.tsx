import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  render,
} from '@react-email/components';

import * as React from 'react';

import { format } from 'date-fns';

import { FEEINPROCENT } from '@/config';
import { formatPrice } from '@/lib/utils';

interface ReceiptEmailProps {
  email: string;
  date: Date;
  orderId: string;
  products: ProdType[];
  collectPaymentLink?: string;
  stripeAccount?: boolean;
  mainUrl?: string;
}

interface ProdType {
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  name: string;
  description: string;
  userId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
  category: string;
}

export const ReceiptEmail = ({
  email,
  date,
  orderId,
  products,
  collectPaymentLink,
  stripeAccount,
  mainUrl,
}: ReceiptEmailProps) => {
  const transactionFee = products.reduce(
    (acc, curr) => acc + curr.price * FEEINPROCENT,
    0
  );

  const total = products.reduce(
    (acc, curr) => acc + curr.price + curr.price * FEEINPROCENT,
    0
  );

  return (
    <Html>
      <Head />
      <Preview>Your Pluto Market Receipt</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section>
            <Column>
              <Img
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}/eis.jpg`}
                width='100'
                height='100'
                alt='Pluto Market'
              />
            </Column>

            <Column align='right' style={tableCell}>
              {collectPaymentLink ? (
                <Text style={heading}>
                  You just sold {products.length} products!
                </Text>
              ) : (
                <Text style={heading}>Thanks for your Order!</Text>
              )}
              <Text style={heading}>Receipt</Text>
            </Column>
          </Section>
          <Section style={informationTable}>
            <Row style={informationTableRow}>
              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>EMAIL</Text>
                <Link
                  style={{
                    ...informationTableValue,
                  }}>
                  {email}
                </Link>
              </Column>

              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>INVOICE DATE</Text>
                <Text style={informationTableValue}>
                  {format(date, 'dd MMM yyyy')}
                </Text>
              </Column>

              <Column style={informationTableColumn}>
                <Text style={informationTableLabel}>ORDER ID</Text>
                <Link
                  style={{
                    ...informationTableValue,
                  }}>
                  {orderId}
                </Link>
              </Column>
            </Row>
          </Section>
          <Section style={productTitleTable}>
            <Text style={productsTitle}>Order Summary</Text>
          </Section>
          {products.map((product) => {
            const image = product.imageUrls[0];

            return (
              <Section key={product.id}>
                <Column style={{ width: '64px' }}>
                  <Img
                    src={image}
                    width='64'
                    height='64'
                    alt='Product Image'
                    style={productIcon}
                  />
                </Column>
                <Column style={{ paddingLeft: '22px' }}>
                  <Text style={productTitle}>{product.name}</Text>
                  {product.description ? (
                    <Text style={productDescription}>
                      {product.description.length > 50
                        ? product.description?.slice(0, 50) + '...'
                        : product.description}
                    </Text>
                  ) : null}
                </Column>

                <Column style={productPriceWrapper} align='right'>
                  <Text style={productPrice}>{formatPrice(product.price)}</Text>
                </Column>
              </Section>
            );
          })}

          <Section style={{ textAlign: 'center' }}>
            <Column style={{ width: '64px' }}></Column>
            <Column
              style={{
                paddingLeft: '40px',
                paddingTop: 20,
              }}>
              <Text style={productTitle}>Transaction Fee</Text>
            </Column>

            <Column style={productPriceWrapper} align='right'>
              <Text style={productPrice}>{formatPrice(transactionFee)}</Text>
            </Column>
          </Section>

          <Hr style={productPriceLine} />
          <Section align='right'>
            <Column style={tableCell} align='right'>
              <Text style={productPriceTotal}>TOTAL</Text>
            </Column>
            <Column style={productPriceVerticalLine}></Column>
            <Column style={productPriceLargeWrapper}>
              <Text style={productPriceLarge}>{formatPrice(total)}</Text>
            </Column>
          </Section>

          <Hr style={productPriceLineBottom} />
          {/* TODO: add the seller dashboard link to the email */}
          {stripeAccount ? (
            <Section style={{ textAlign: 'center' }}>
              <Column style={{ width: '64px' }}></Column>
              <Text
                style={{ ...resetText, fontSize: '22px', marginLeft: '25px' }}>
                <Link href={`${mainUrl}/dashboard`}>
                  Click this link to collect your payment.
                </Link>
              </Text>
              <br />
              <Text style={{ fontSize: '14px', marginLeft: '25px' }}>
                Or copy and paste the following link in your browser:{' '}
                {`${mainUrl}/dashboard`}
              </Text>
            </Section>
          ) : (
            <Section style={{ textAlign: 'center' }}>
              <Column style={{ width: '64px' }}></Column>
              <Text
                style={{ ...resetText, fontSize: '22px', marginLeft: '25px' }}>
                <Link href='https://dashboard.stripe.com/register'>
                  Please create a stripe account.
                </Link>
                <Text style={{ fontSize: '14px', marginLeft: '25px' }}>
                  Or if you have already a stripe account, connect it to Pluto
                  Market dashboard.
                </Text>
                <Link href={`${mainUrl}/dashboard`}>
                  Connect your stripe account with Pluto Market.
                </Link>
              </Text>
            </Section>
          )}

          <Text style={footerLinksWrapper}>
            <Link href='/dashboard'>Account Settings</Link> •{' '}
            <Link href='#'>Terms of Sale</Link> •{' '}
            <Link href='#'>Privacy Policy </Link>
          </Text>
          <Text style={footerCopyright}>
            Copyright © {new Date().getFullYear()} Pluto Market Inc. <br />{' '}
            <Link href='#'>All rights reserved by GW-Intech</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const ReceiptEmailHtml = (props: ReceiptEmailProps) =>
  render(<ReceiptEmail {...props} />, {
    pretty: true,
  });

const main = {
  fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  backgroundColor: '#ffffff',
};

const resetText = {
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '660px',
};

const tableCell = { display: 'table-cell' };

const heading = {
  fontSize: '28px',
  fontWeight: '300',
  color: '#888888',
};

const informationTable = {
  borderCollapse: 'collapse' as const,
  borderSpacing: '0px',
  color: 'rgb(51,51,51)',
  backgroundColor: 'rgb(250,250,250)',
  borderRadius: '3px',
  fontSize: '12px',
  marginTop: '12px',
};

const informationTableRow = {
  height: '46px',
};

const informationTableColumn = {
  paddingLeft: '20px',
  borderStyle: 'solid',
  borderColor: 'white',
  borderWidth: '0px 1px 1px 0px',
  height: '44px',
};

const informationTableLabel = {
  ...resetText,
  color: 'rgb(102,102,102)',
  fontSize: '10px',
};

const informationTableValue = {
  fontSize: '12px',
  margin: '0',
  padding: '0',
  lineHeight: 1.4,
};

const productTitleTable = {
  ...informationTable,
  margin: '30px 0 15px 0',
  height: '24px',
};

const productsTitle = {
  background: '#fafafa',
  paddingLeft: '10px',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const productIcon = {
  margin: '0 0 0 20px',
  borderRadius: '14px',
  border: '1px solid rgba(128,128,128,0.2)',
};

const productTitle = {
  fontSize: '12px',
  fontWeight: '600',
  ...resetText,
};

const productDescription = {
  fontSize: '12px',
  color: 'rgb(102,102,102)',
  ...resetText,
};

const productLink = {
  fontSize: '12px',
  color: 'rgb(0,112,201)',
  textDecoration: 'none',
};

const productPriceTotal = {
  margin: '0',
  color: 'rgb(102,102,102)',
  fontSize: '10px',
  fontWeight: '600',
  padding: '0px 30px 0px 0px',
  textAlign: 'right' as const,
};

const productPrice = {
  fontSize: '12px',
  fontWeight: '600',
  marginTop: '15px',
};

const productPriceLarge = {
  margin: '0px 20px 0px 0px',
  fontSize: '16px',
  fontWeight: '600',
  whiteSpace: 'nowrap' as const,
  textAlign: 'right' as const,
};

const productPriceWrapper = {
  display: 'table-cell',
  padding: '0px 20px 0px 0px',
  width: '100px',
  verticalAlign: 'top',
};

const productPriceLine = { margin: '30px 0 0 0' };

const productPriceVerticalLine = {
  height: '48px',
  borderLeft: '1px solid',
  borderColor: 'rgb(238,238,238)',
};

const productPriceLargeWrapper = {
  display: 'table-cell',
  width: '90px',
};

const productPriceLineBottom = { margin: '0 0 75px 0' };

const footerLinksWrapper = {
  margin: '8px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};

const footerCopyright = {
  margin: '25px 0 0 0',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: 'rgb(102,102,102)',
};
