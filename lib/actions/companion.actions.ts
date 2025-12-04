'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// CREATE COMPANION
export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  if (!author) throw new Error("User not authenticated");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error || !data) throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

// GET ALL COMPANIONS
export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  try {
    const supabase = await createSupabaseClient();

    let query = supabase.from("companions").select();

    if (subject && topic) {
      query = query.ilike("subject", `%${subject}%`).or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
      query = query.ilike("subject", `%${subject}%`);
    } else if (topic) {
      query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data || [];
  } catch (err: any) {
    console.error("getAllCompanions error:", err.message);
    return [];
  }
};

// GET SINGLE COMPANION
export const getCompanion = async (id: string) => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("companions")
      .select()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return data?.[0] || null;
  } catch (err: any) {
    console.error("getCompanion error:", err.message);
    return null;
  }
};

// ADD TO SESSION HISTORY
export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .insert({ companion_id: companionId, user_id: userId });

  if (error) throw new Error(error.message);

  return data || [];
};

// RECENT SESSIONS
export const getRecentSessions = async (limit = 10) => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("session_history")
      .select(`companions:companion_id (*)`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getRecentSessions error:", err.message);
    return [];
  }
};

// USER SESSIONS
export const getUserSessions = async (userId: string, limit = 10) => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("session_history")
      .select(`companions:companion_id (*)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getUserSessions error:", err.message);
    return [];
  }
};

// USER COMPANIONS
export const getUserCompanions = async (userId: string) => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("companions")
      .select()
      .eq("author", userId);

    if (error) throw new Error(error.message);

    return data || [];
  } catch (err: any) {
    console.error("getUserCompanions error:", err.message);
    return [];
  }
};

// PERMISSIONS
export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = await createSupabaseClient();
  let limit = 0;

  if (has({ plan: "pro" })) return true;
  if (has({ feature: "3_companion_limit" })) limit = 3;
  if (has({ feature: "10_companion_limit" })) limit = 10;

  try {
    const { data, error } = await supabase
      .from("companions")
      .select("id", { count: "exact" })
      .eq("author", userId);

    if (error) throw new Error(error.message);

    const companionCount = data?.length || 0;
    return companionCount < limit;
  } catch (err: any) {
    console.error("newCompanionPermissions error:", err.message);
    return false;
  }
};

// BOOKMARKS ADD
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ companion_id: companionId, user_id: userId });

  if (error) throw new Error(error.message);

  revalidatePath(path);
  return data || [];
};

// BOOKMARK REMOVE
export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath(path);
  return data || [];
};

// GET BOOKMARKED
export const getBookmarkedCompanions = async (userId: string) => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select(`companions:companion_id (*)`)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getBookmarkedCompanions error:", err.message);
    return [];
  }
};
