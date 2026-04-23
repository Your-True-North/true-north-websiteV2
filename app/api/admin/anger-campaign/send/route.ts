import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'True North <navigate@yourtruenorth.me>'
const BOOK_URL = 'https://yourtruenorth.me/contact'
const UNSUBSCRIBE_URL = 'https://yourtruenorth.me/unsubscribe'

function baseTemplate(previewText: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>True North</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:Georgia,serif;">
<div style="display:none;max-height:0;overflow:hidden;color:#0a0a0b;">${previewText}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#9bc4b8;letter-spacing:4px;text-transform:uppercase;">TRUE NORTH</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#111113;border-radius:8px;padding:48px 40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:32px;">
            <p style="margin:0;font-size:12px;color:#555;font-family:Arial,sans-serif;">
              You received this because you expressed interest in the Men's Anger Programme.<br/>
              <a href="${UNSUBSCRIBE_URL}" style="color:#555;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function p(text: string) {
  return `<p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#d4d0c8;font-family:Georgia,serif;">${text}</p>`
}

function cta(text: string) {
  return `<div style="text-align:center;margin:36px 0;">
    <a href="${BOOK_URL}" style="display:inline-block;background:#9bc4b8;color:#0a0a0b;font-family:Arial,sans-serif;font-weight:700;font-size:15px;letter-spacing:1px;text-decoration:none;padding:16px 40px;border-radius:4px;">${text}</a>
  </div>`
}

function sig() {
  return `<p style="margin:32px 0 0;font-size:16px;color:#9bc4b8;font-family:Georgia,serif;">Mason<br/><span style="font-size:13px;color:#666;">True North</span></p>`
}

const EMAILS: Record<number, { subject: string; preview: string; html: string }> = {
  1: {
    subject: "You'd rather tell people you're an alcoholic",
    preview: "Most men find it easier to admit that than to admit they have an anger problem.",
    html: baseTemplate(
      "Most men find it easier to admit that than to admit they have an anger problem.",
      `${p("Most men find it easier to tell people they are an alcoholic than to admit they have an anger problem.")}
${p("Think about that for a second.")}
${p("Alcoholism gets sympathy. People understand it. There are meetings for it. Films are made about it.")}
${p("But anger? Anger gets you labelled. Dangerous. Difficult. Unpredictable.")}
${p("So men manage it. They suppress it. They justify it. They find ways to explain it away.")}
${p("Until they can't anymore.")}
${p("The relationship breaks. The job is on the line. The kids start flinching. And then they reach out.")}
${p("I built the Men's Anger Programme because I was that man. And because most of the help available treats anger like a behaviour problem to be managed. It is not. It is a signal. A messenger. Something underneath that has never been heard.")}
${p("This programme does not teach you to suppress it better. It takes you to the root.")}
${cta("Find Out More")}
${sig()}`
    )
  },
  2: {
    subject: "Your anger is not the problem",
    preview: "What it's protecting is.",
    html: baseTemplate(
      "What it's protecting is.",
      `${p("Your anger is not the problem.")}
${p("It never was.")}
${p("Anger is the guard dog. Loyal, loud, always on watch. It does not cause the wound. It stands over it.")}
${p("Every man I have worked with who struggles with anger has something underneath it. Shame. Grief. Fear. An old humiliation that never got processed. A version of themselves they had to abandon to survive.")}
${p("The anger keeps people at a safe distance from that place.")}
${p("The work is not to quieten the dog. The work is to go to what the dog is protecting.")}
${p("When you do that - when you actually meet that part of yourself - the anger does not disappear. It transforms. It becomes fuel. It becomes boundaries. It becomes presence.")}
${p("That is what twelve weeks looks like. Not anger management. A return to yourself.")}
${cta("Book a Discovery Call")}
${sig()}`
    )
  },
  3: {
    subject: "I used to scare people",
    preview: "Not because I was violent. Because they never knew which version of me was walking through the door.",
    html: baseTemplate(
      "Not because I was violent. Because they never knew which version of me was walking through the door.",
      `${p("I used to scare people.")}
${p("Not because I was violent. Because they never knew which version of me was walking through the door.")}
${p("The one who was calm, funny, generous. Or the one who was reactive, closed off, coiled tight.")}
${p("I could not predict it myself. That was the terrifying part.")}
${p("I had done everything right on paper. Built businesses. Got fit. Read the books. Done the courses. And still something inside me would trip and I would become someone I did not recognise.")}
${p("The turning point was not a technique. It was understanding. What was actually happening in my body when that switch flipped. Where it came from. Why it existed in the first place.")}
${p("That understanding did not come from talking about it. It came from going into it. Somatically. With breath. With presence. With the right guide and the right container.")}
${p("That is what I built the Men's Anger Programme to be.")}
${cta("I Want to Know More")}
${sig()}`
    )
  },
  4: {
    subject: "What your anger is actually costing you",
    preview: "Most men only count what they've already lost. But the invisible cost is bigger.",
    html: baseTemplate(
      "Most men only count what they've already lost. But the invisible cost is bigger.",
      `${p("Most men only count what they have already lost.")}
${p("The relationship that ended. The opportunity that passed. The moment their kid looked at them differently.")}
${p("But the invisible cost is bigger.")}
${p("It is the energy you spend holding it down every day. The vigilance. The bracing. The low-grade tension that never fully leaves.")}
${p("It is the version of yourself you cannot access because too much bandwidth is going to managing the pressure.")}
${p("The leadership you could offer but don't. The intimacy you want but protect yourself from. The rest you cannot find because you are always slightly on guard.")}
${p("That is what unresolved anger costs. Not just in the moments it spills. In all the moments in between.")}
${p("The Men's Anger Programme is twelve weeks. Ten men. Real work. If you are sitting on the fence, I want to ask you one question.")}
${p("How much longer are you willing to pay that cost?")}
${cta("Book Your Discovery Call")}
${sig()}`
    )
  },
  5: {
    subject: "10 men. 12 weeks. Let's go.",
    preview: "The next cohort of the Men's Anger Programme is forming now.",
    html: baseTemplate(
      "The next cohort of the Men's Anger Programme is forming now.",
      `${p("The next cohort of the Men's Anger Programme is forming now.")}
${p("Ten men. Twelve weeks. One container built specifically for men who are done with managing their anger and ready to understand it.")}
${p("This is not a workshop. It is not a seminar. It is immersive, relational, somatic work. Weekly group sessions. Optional 1:1 time. A private community. Breathwork. Nervous system tools. And a guide who has lived this, not just studied it.")}
${p("Places are limited to ten because the work requires space. I will not pack a room to fill a number.")}
${p("If you have been following these emails and something in them has landed, this is the next step. Book a discovery call. We will talk about where you are, what you are carrying, and whether this programme is the right fit.")}
${p("No pressure. No sales pitch. Just a real conversation.")}
${cta("Book a Discovery Call")}
${sig()}`
    )
  },
  6: {
    subject: "I can manage it myself",
    preview: "That's what every man says before he reaches out.",
    html: baseTemplate(
      "That's what every man says before he reaches out.",
      `${p("That is what every man says before he reaches out.")}
${p("And to be fair, they usually can. For a while.")}
${p("The breathing techniques. The gym. The cold exposure. The journaling. The meditation app. They work - until something big enough hits, or until the pressure builds past a certain point.")}
${p("And then the lid comes off again.")}
${p("I am not saying those tools do not have value. I use most of them. But they are coping tools. They help you manage the surface.")}
${p("What I do with men goes deeper. We work with the nervous system at a level that rewires the automatic response, not just the conscious one. We work somatically. We work with breath in a way that most men have never experienced.")}
${p("Managing it yourself is a ceiling. The work I do removes the ceiling.")}
${p("If you are near the end of what you can manage on your own, this is worth a conversation.")}
${cta("Let's Talk")}
${sig()}`
    )
  },
  7: {
    subject: "Last call",
    preview: "This cohort closes in 48 hours.",
    html: baseTemplate(
      "This cohort closes in 48 hours.",
      `${p("This cohort closes in 48 hours.")}
${p("If you have been reading these emails and something has resonated - if you have recognised yourself in any of it - this is the moment.")}
${p("After this, the next cohort will be months away. And I know from experience that when a man says 'maybe next time', nine times out of ten nothing changes in the gap. The same patterns continue. The same cost accumulates.")}
${p("I am not here to pressure you. But I am going to be direct: if you are ready to do the real work, this is the right time.")}
${p("Book a discovery call today. We will talk. If it is not the right fit, I will tell you. But if it is, we begin.")}
${cta("Book Now - Last Spaces")}
${p("<span style='font-size:14px;color:#888;'>If the timing genuinely is not right, no problem at all. Take care of yourself.</span>")}
${sig()}`
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { emailNumber, testEmail } = await request.json()

    if (!emailNumber || !EMAILS[emailNumber]) {
      return NextResponse.json({ error: 'Invalid email number (1-7)' }, { status: 400 })
    }

    const template = EMAILS[emailNumber]

    // Test mode: send to single address
    if (testEmail) {
      const { error } = await resend.emails.send({
        from: FROM,
        to: testEmail,
        subject: `[TEST] ${template.subject}`,
        html: template.html
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, sent: 1, mode: 'test' })
    }

    // Live send to all active subscribers
    const result = await query(
      `SELECT email, name FROM anger_campaign_subscribers WHERE unsubscribed = false`
    )
    const subscribers = result.rows

    if (subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })
    }

    // Send in batches of 10 (Resend batch limit per second)
    let successCount = 0
    const errors: string[] = []

    for (const sub of subscribers) {
      try {
        await resend.emails.send({
          from: FROM,
          to: sub.email,
          subject: template.subject,
          html: template.html
        })
        successCount++
        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 100))
      } catch (err: unknown) {
        errors.push(`${sub.email}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    // Record this send
    await query(
      `INSERT INTO anger_campaign_sends (email_number, recipient_count) VALUES ($1, $2)`,
      [emailNumber, successCount]
    )

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (err) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}

export async function GET() {
  // Return send history
  try {
    const result = await query(
      `SELECT email_number, sent_at, recipient_count
       FROM anger_campaign_sends
       ORDER BY sent_at DESC`
    )
    return NextResponse.json({ sends: result.rows })
  } catch (err) {
    console.error('GET sends error:', err)
    return NextResponse.json({ error: 'Failed to fetch sends' }, { status: 500 })
  }
}
