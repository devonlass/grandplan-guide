import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchSignedUrl } from '@/lib/hubspot';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  plan_id: string;
  name: string;
  url: string | null;
  hubspot_file_id: string | null;
  file_type: string | null;
  file_size: number | null;
  source: 'hubspot' | 'manual';
  uploaded_at: string;
  created_at: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAttachments(planId: string | undefined) {
  return useQuery<Attachment[]>({
    queryKey: ['attachments', planId],
    queryFn: async () => {
      if (!planId) return [];
      try {
        const { data, error } = await supabase
          .from('attachments')
          .select('*')
          .eq('plan_id', planId)
          .order('uploaded_at', { ascending: false });
        if (error) return [];
        return (data ?? []) as Attachment[];
      } catch {
        return [];
      }
    },
    enabled: !!planId,
    retry: false,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

interface CreateAttachmentInput {
  plan_id: string;
  name: string;
  url?: string | null;
  hubspot_file_id?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  source?: 'hubspot' | 'manual';
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAttachmentInput): Promise<Attachment | null> => {
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          plan_id:         input.plan_id,
          name:            input.name,
          url:             input.url ?? null,
          hubspot_file_id: input.hubspot_file_id ?? null,
          file_type:       input.file_type ?? null,
          file_size:       input.file_size ?? null,
          source:          input.source ?? 'manual',
        })
        .select()
        .single();
      // 23505 = unique_violation: file already synced for this plan — skip
      if (error?.code === '23505') return null;
      if (error) throw error;
      return data as Attachment;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', vars.plan_id] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, plan_id }: { id: string; plan_id: string }) => {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return plan_id;
    },
    onSuccess: (plan_id) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', plan_id] });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Open a HubSpot attachment. Fetches a fresh signed URL first (bypasses auth),
 * falling back to the stored URL if the signed-URL endpoint fails.
 */
export async function openHubSpotFile(attachment: Attachment): Promise<void> {
  let url = attachment.url;

  if (attachment.hubspot_file_id) {
    const signed = await fetchSignedUrl(attachment.hubspot_file_id);
    if (signed) url = signed;
  }

  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Derive a file type category from a filename extension.
 */
export function fileTypeFromName(name: string): 'document' | 'image' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf', 'doc', 'docx', 'xlsx', 'xls', 'txt', 'csv'].includes(ext)) return 'document';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

/**
 * Format bytes into a human-readable size string.
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}
