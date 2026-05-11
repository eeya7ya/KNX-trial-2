# KNX Club Jordan — Admin Guide

A support handbook for administrators who manage the KNX Club Jordan website.

This guide explains everything an administrator can see and do inside the **Admin Area**. No prior preparation is required other than the admin password.

---

## 1. Signing In

1. Open the website and add **/admin/login** to the address bar (for example, `https://your-site/admin/login`).
2. You will see a sign-in screen titled **Admin sign in** with the message *"Enter the admin password to continue."*
3. Type the admin password into the **Password** field.
4. Click **Sign in**.
   - While the system checks your password the button shows **Signing in…**
   - If the password is wrong, a red error message appears beneath the form.
   - On success you are taken to the **Dashboard**.

You stay signed in for the rest of the session. To leave the admin area at any time, click **Sign out** at the bottom of the left sidebar.

---

## 2. The Admin Sidebar

After signing in, a vertical menu on the left is shown on every admin page:

| Item            | What it opens                                                    |
|-----------------|------------------------------------------------------------------|
| Dashboard       | The overview screen with summary numbers.                        |
| Members         | The list of people who signed up for the club.                   |
| Visitors        | The log of pages people viewed on the site.                      |
| Communications  | Messages received through the contact channel.                   |
| News            | Add or remove news articles.                                     |
| Videos          | Add or remove videos in the gallery.                             |
| Pictures        | Add or remove photos in the gallery.                             |
| Prompts         | Manage the prompts library.                                      |
| Team            | Manage board members and partner companies.                      |
| Sign out        | Log out of the admin area.                                       |

---

## 3. The Dashboard

The Dashboard is the first screen you see after signing in.

- **Title:** Dashboard
- **Description:** *"Overview of activity on the KNX Club site."*

It shows summary cards with the current totals for:

- **Members** — how many people have signed up.
- **Visitors** — how many page visits have been recorded.
- **Communications** — how many messages have been received.
- **News** — number of news articles.
- **Videos** — number of videos in the gallery.
- **Pictures** — number of photos in the gallery.
- **Prompts** — number of items in the prompts library.

Use the Dashboard as a quick health check before going into the detail screens.

---

## 4. Members

**Where:** Sidebar → **Members**

A table of the people who have used the **Join the club** form on the public site.

| Column   | Meaning                                  |
|----------|------------------------------------------|
| Name     | Full name they entered.                  |
| Email    | Email address they entered.              |
| Role     | The role they typed (may be blank).      |
| Joined   | Date and time of signup.                 |

- The list shows the most recent **500** members, newest first.
- If a person submits the form a second time with the same email, their existing record is updated — you will not see duplicates.

**Common support tasks here:**

- Looking up a person who says they joined but did not hear back.
- Sharing the latest list of members with the club team.
- Confirming someone's signup date.

---

## 5. Visitors

**Where:** Sidebar → **Visitors**

A log of recent page visits. Each visit is recorded only once per browsing session, so the numbers reflect real interest rather than every click.

| Column     | Meaning                                                      |
|------------|--------------------------------------------------------------|
| When       | Date and time of the visit.                                  |
| Path       | Which page was viewed (for example `/en/news`).              |
| Locale     | Language at the time of the visit (`ar` or `en`).            |
| IP         | The visitor's network address.                               |
| User agent | The browser / device the visitor was using.                  |

- The last **500** visits are shown, newest first.
- This is useful to see which pages are popular and to confirm that the site is reachable from different networks.

---

## 6. Communications

**Where:** Sidebar → **Communications**

A grid of cards, one per message received through the site's contact channel.

Each card shows:

- The sender's **name** (in bold).
- The sender's **email** address.
- The **subject** (if one was provided).
- The **message body**.
- The **timestamp** of the message.

The most recent **200** messages are shown, newest first.

**Tip:** Reply to the sender using the email address on the card — the admin area is for review only and does not send replies on its own.

---

## 7. Managing Content

The five content sections — **News**, **Videos**, **Pictures**, **Prompts**, and **Team** — all behave in the same way.

Each page has:

1. A **title** and a short description: *"Add, view, and remove [the content type]."*
2. A **form at the top** for adding a new item.
3. A **list below** showing existing items, newest first (up to 200 entries).

### 7.1 Adding an Item

Fill in the fields shown in the form (see the field tables in the sections below), then click **Save**. The new item appears in the list immediately.

If an item has an **image**, **photo**, or **video** field, you can either:

- Paste a public URL into the field, or
- Click **Upload to R2** to upload a file from your computer. A progress indicator appears while the file is uploading. When finished, the public URL is filled in automatically.

Each form has a **Published** checkbox. It is **checked by default**:

- **Checked:** the item is visible on the public website.
- **Unchecked:** the item is saved but hidden from the public site (useful for drafts).

### 7.2 Removing an Item

Each row in the list has a **delete** button (trash icon). Clicking it asks for confirmation: *"Delete this entry?"*

- Click **OK** to remove the item permanently.
- Click **Cancel** to keep it.

Deletion is final — there is no undo, so double-check before confirming.

### 7.3 Field-by-Field Reference

#### News

| Field      | Required? | Notes                                                                |
|------------|-----------|----------------------------------------------------------------------|
| Title      | Yes       | Shown on the news card and the article page.                         |
| Body       | Yes       | The article text.                                                    |
| Image URL  | Optional  | Used as the cover image. You can paste a URL or use **Upload to R2**.|
| Published  | Optional  | On = visible on the public site.                                     |

#### Videos

| Field       | Required? | Notes                                                                            |
|-------------|-----------|----------------------------------------------------------------------------------|
| Title       | Yes       | Shown above the video in the gallery.                                            |
| Video URL   | Yes       | A YouTube or Vimeo link, or an uploaded video file (via **Upload to R2**).       |
| Description | Optional  | Short caption shown next to the video.                                           |
| Published   | Optional  | On = visible on the public site.                                                 |

#### Pictures

| Field       | Required? | Notes                                                                            |
|-------------|-----------|----------------------------------------------------------------------------------|
| Title       | Yes       | Shown above the photo.                                                           |
| Image URL   | Yes       | A public image URL or one uploaded via **Upload to R2**.                         |
| Description | Optional  | Short caption shown beneath the photo.                                           |
| Published   | Optional  | On = visible on the public site.                                                 |

#### Prompts

| Field        | Required? | Notes                                                              |
|--------------|-----------|--------------------------------------------------------------------|
| Title        | Yes       | A short name for the prompt.                                       |
| Prompt text  | Yes       | The full prompt content.                                           |
| Tags         | Optional  | Comma-separated keywords for grouping (for example `ets, secure`). |
| Published    | Optional  | On = visible on the public site.                                   |

#### Team

| Field                                              | Required? | Notes                                                                       |
|----------------------------------------------------|-----------|-----------------------------------------------------------------------------|
| Name                                               | Yes       | The person's or company's name.                                             |
| Role / position                                    | Optional  | For board members (for example *Chair*, *Treasurer*).                       |
| Company                                            | Optional  | The organisation they represent.                                            |
| Photo                                              | Optional  | Their portrait or company logo. URL or **Upload to R2**.                    |
| **Mark as KNX partner (shows partner logo)**       | Optional  | Tick to display the **KNX partner** badge and move the entry to the partner section. |
| Published                                          | Optional  | On = visible on the public site.                                            |

---

## 8. Uploading Files (the "Upload to R2" Button)

Wherever a media field appears, the **Upload to R2** button lets you upload a file directly instead of pasting a URL.

1. Click **Upload to R2** next to the field.
2. Choose a file from your computer.
3. Wait for the progress indicator to reach 100%.
4. The URL field is filled in automatically with the new public link.
5. Save the form as normal.

If the upload fails:

- Check that the file is not unusually large.
- Make sure you have a stable internet connection.
- Try again — temporary errors usually resolve on a retry.

---

## 9. Publishing Workflow (Recommended)

A simple, safe routine for adding new content:

1. **Prepare** the title, text, and any image/video file on your computer.
2. **Sign in** to the admin area.
3. Open the matching section (News, Videos, Pictures, Prompts, or Team).
4. **Uncheck Published** if you want to preview your work without making it live yet.
5. Fill in the fields, upload any media, and click **Save**.
6. Open the public site in another tab to confirm the result looks right.
7. When happy, edit the item back to **Published** (or simply leave the box checked from the start when you are confident).

---

## 10. Daily Support Checklist

A short routine an admin can do every day:

1. **Dashboard** — glance at the totals to spot anything unusual.
2. **Members** — check for new signups; pass new names to the team for welcome follow-up.
3. **Communications** — read and reply (by email) to any new messages.
4. **News / Gallery** — publish any new announcements, photos, or videos from recent activities.
5. **Visitors** — confirm the site is being reached and which pages are popular.

---

## 11. Troubleshooting

| Situation                                              | What to do                                                                              |
|--------------------------------------------------------|------------------------------------------------------------------------------------------|
| "Sign in" keeps failing.                               | Confirm you are using the correct password. Passwords are case-sensitive.               |
| You are returned to the sign-in page after a while.    | Sessions expire; sign in again to continue.                                              |
| A new item does not appear on the public site.         | Make sure the **Published** checkbox is ticked.                                          |
| You uploaded a file but the page looks broken.         | Confirm the URL field was filled in; if not, click **Upload to R2** again.               |
| You deleted the wrong item.                            | Deletion is final — re-create the item from your records.                                |
| You no longer remember the admin password.             | Contact the website owner / technical contact to receive a new password.                 |
| A user reports they did not get a confirmation email.  | Open **Members** to confirm the signup is recorded; ask them to check their spam folder. |
| Numbers on the Dashboard look wrong.                   | Refresh the page — totals are recalculated on each visit.                                |

---

## 12. Good Practices

- **Sign out** when you are finished, especially on shared computers.
- **Do not share** the admin password by email or chat — only with people who genuinely need it.
- **Preview before publishing** by using the Published checkbox.
- **Reply quickly** to incoming messages — visitors who reach out are usually interested in joining or partnering.
- **Keep names consistent** in the Team section (for example, always spell company names the same way).
- **Tag prompts** clearly so other admins can find them later.

---

*End of Admin Guide.*
