'use client';

import { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/shared/StarRating';
import { EmptyState, Spinner } from '@/components/shared/states';
import { formatDate } from '@/lib/utils';

export function ReviewSection({ productId }: { productId: string }) {
  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.review.forProduct.useQuery({ productId });
  const { data: mine } = trpc.review.mine.useQuery(
    { productId },
    // Only signed-in buyers can review; a 401 here is expected and harmless.
    { retry: false }
  );

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);

  const refresh = () => {
    utils.review.forProduct.invalidate({ productId });
    utils.review.mine.invalidate({ productId });
    utils.product.bySlug.invalidate();
  };

  const upsert = trpc.review.upsert.useMutation({
    onSuccess: () => {
      toast.success('Thanks for your review');
      setEditing(false);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = trpc.review.delete.useMutation({
    onSuccess: () => {
      toast.success('Review removed');
      setRating(0);
      setComment('');
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const showForm = mine?.canReview && (!mine.review || editing);

  return (
    <section className='mt-16 border-t border-stone-200 pt-10'>
      <h2 className='text-lg font-bold tracking-tight text-stone-900'>
        Reviews {reviews?.length ? `(${reviews.length})` : ''}
      </h2>

      {showForm ? (
        <div className='mt-6 rounded-xl border border-stone-200 bg-stone-50/60 p-5'>
          <p className='text-sm font-medium text-stone-900'>
            {mine?.review ? 'Update your review' : 'Rate this product'}
          </p>

          <StarRating
            size={22}
            className='mt-3'
            value={rating || mine?.review?.rating || 0}
            onChange={setRating}
          />

          <Textarea
            className='mt-4 bg-white'
            placeholder='What did you think? (optional)'
            maxLength={1000}
            value={comment || (mine?.review?.comment ?? '')}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className='mt-4 flex gap-2'>
            <Button
              size='sm'
              disabled={upsert.isPending || (!rating && !mine?.review?.rating)}
              onClick={() =>
                upsert.mutate({
                  productId,
                  rating: rating || mine?.review?.rating || 5,
                  comment: (comment || mine?.review?.comment) ?? undefined,
                })
              }>
              {upsert.isPending ? <Spinner className='mr-2' /> : null}
              {mine?.review ? 'Save changes' : 'Post review'}
            </Button>
            {editing ? (
              <Button size='sm' variant='ghost' onClick={() => setEditing(false)}>
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {mine?.review && !editing ? (
        <div className='mt-6 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 px-5 py-4'>
          <div>
            <p className='text-sm font-medium text-indigo-900'>Your review</p>
            <StarRating value={mine.review.rating} className='mt-1' />
          </div>
          <div className='flex gap-1'>
            <Button size='sm' variant='ghost' onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              size='sm'
              variant='ghost'
              disabled={remove.isPending}
              onClick={() => remove.mutate({ id: mine.review!.id })}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      ) : null}

      <div className='mt-8 space-y-6'>
        {isLoading ? (
          <Spinner />
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className='flex gap-4'>
              <Avatar className='h-9 w-9 shrink-0'>
                {review.author.image ? (
                  <AvatarImage src={review.author.image} alt='' />
                ) : null}
                <AvatarFallback>
                  {(review.author.name ?? '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                  <span className='text-sm font-medium text-stone-900'>
                    {review.author.name ?? 'Anonymous'}
                  </span>
                  <StarRating value={review.rating} />
                  <span className='text-xs text-muted-foreground'>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment ? (
                  <p className='mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600'>
                    {review.comment}
                  </p>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={MessageSquare}
            title='No reviews yet'
            description='Only verified buyers can leave a review, so every rating here comes from a real purchase.'
          />
        )}
      </div>
    </section>
  );
}
