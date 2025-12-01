// src/app/menu/[slug]/page.tsx
import { notFound } from 'next/navigation';

type Props = { params: { slug: string } };

export default async function MenuItemPage({ params }: Props) {
  const { slug } = params;

  // TODO: replace with Supabase fetch using slug
  // const meal = await getMealBySlug(slug);
  // if (!meal) return notFound();

  return (
    <main>
      <h1>Menu item: {slug}</h1>
      {/* render nutrition + ingredients here */}
    </main>
  );
}
