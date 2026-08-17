import EditProductForm from './EditProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductForm id={id} />;
}
