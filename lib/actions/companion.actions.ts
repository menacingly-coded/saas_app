'use server';

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/* =====================================================
   CREATE COMPANION
===================================================== */
export const createCompanion = async (formData: CreateCompanion) => {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error("createCompanion: user not authenticated");
    return null;
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author: userId })
    .select();

  if (error || !data) {
    console.error("createCompanion error:", error);
    return null;
  }

  return data[0];
};

/* =====================================================
   GET ALL COMPANIONS
===================================================== */
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
      query = query
        .ilike("subject", `%${subject}%`)
        .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if (subject) {
      query = query.ilike("subject", `%${subject}%`);
    } else if (topic) {
      query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("getAllCompanions error:", error.message);
      return [];
    }

    return data || [];
  } catch (err: any) {
    console.error("getAllCompanions crash:", err.message);
    return [];
  }
};

/* =====================================================
   GET SINGLE COMPANION
===================================================== */
export const getCompanion = async (id: string) => {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("companions")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("getCompanion error:", error.message);
      return null;
    }

    return data;
  } catch (err: any) {
    console.error("getCompanion crash:", err.message);
    return null;
  }
};

/* =====================================================
   ADD TO SESSION HISTORY
===================================================== */
export const addToSessionHistory = async (companionId: string) => {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error("addToSessionHistory: user not authenticated");
    return null;
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .insert({ companion_id: companionId, user_id: userId });

  if (error) {
    console.error("addToSessionHistory error:", error.message);
    return null;
  }

  return data || [];
};

/* =====================================================
   RECENT SESSIONS
===================================================== */
export const getRecentSessions = async (limit = 10) => {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("session_history")
      .select(`companions:companion_id (*)`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getRecentSessions error:", error.message);
      return [];
    }

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getRecentSessions crash:", err.message);
    return [];
  }
};

/* =====================================================
   USER SESSIONS
===================================================== */
export const getUserSessions = async (userId: string, limit = 10) => {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("session_history")
      .select(`companions:companion_id (*)`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getUserSessions error:", error.message);
      return [];
    }

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getUserSessions crash:", err.message);
    return [];
  }
};

/* =====================================================
   USER COMPANIONS
===================================================== */
export const getUserCompanions = async (userId: string) => {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("companions")
      .select()
      .eq("author", userId);

    if (error) {
      console.error("getUserCompanions error:", error.message);
      return [];
    }

    return data || [];
  } catch (err: any) {
    console.error("getUserCompanions crash:", err.message);
    return [];
  }
};

/* =====================================================
   PERMISSIONS
===================================================== */
export const newCompanionPermissions = async () => {
  const authData = await auth();
  const userId = authData.userId;
  const has = authData.has;

  if (!userId) {
    console.error("Permissions: user not authenticated");
    return false;
  }

  if (has?.({ plan: "pro" })) return true;

  let limit = 0;
  if (has?.({ feature: "3_companion_limit" })) limit = 3;
  if (has?.({ feature: "10_companion_limit" })) limit = 10;

  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("companions")
      .select("id")
      .eq("author", userId);

    if (error) {
      console.error("newCompanionPermissions error:", error.message);
      return false;
    }

    return (data?.length || 0) < limit;
  } catch (err: any) {
    console.error("newCompanionPermissions crash:", err.message);
    return false;
  }
};

/* =====================================================
   BOOKMARK ADD
===================================================== */
export const addBookmark = async (companionId: string, path: string) => {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error("addBookmark: user not authenticated");
    return null;
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ companion_id: companionId, user_id: userId });

  if (error) {
    console.error("addBookmark error:", error.message);
    return null;
  }

  revalidatePath(path);
  return data || [];
};

/* =====================================================
   BOOKMARK REMOVE
===================================================== */
export const removeBookmark = async (companionId: string, path: string) => {
  const authData = await auth();
  const userId = authData.userId;

  if (!userId) {
    console.error("removeBookmark: user not authenticated");
    return null;
  }

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);

  if (error) {
    console.error("removeBookmark error:", error.message);
    return null;
  }

  revalidatePath(path);
  return data || [];
};

/* =====================================================
   GET BOOKMARKED COMPANIONS
===================================================== */
export const getBookmarkedCompanions = async (userId: string) => {
  try {
    const supabase = await createSupabaseClient();

    const { data, error } = await supabase
      .from("bookmarks")
      .select(`companions:companion_id (*)`)
      .eq("user_id", userId);

    if (error) {
      console.error("getBookmarkedCompanions error:", error.message);
      return [];
    }

    return data?.map(({ companions }) => companions) || [];
  } catch (err: any) {
    console.error("getBookmarkedCompanions crash:", err.message);
    return [];
  }
};
