import SellerProfile from './SellerProfile';

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SellerProfile id={id} />;
}
