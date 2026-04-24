import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'True North <navigate@yourtruenorth.me>'
const BOOK_URL = 'https://calendly.com/callwithmason/the-map'
const UNSUBSCRIBE_URL = 'https://yourtruenorth.me/unsubscribe'

function baseTemplate(previewText: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>True North</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:Georgia,serif;">
<div style="display:none;max-height:0;overflow:hidden;color:#f6f6f6;">${previewText}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Logo -->
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#38485d;letter-spacing:4px;text-transform:uppercase;">TRUE NORTH</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;border-radius:8px;padding:48px 40px;border:1px solid rgba(56,72,93,0.1);">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="padding-top:32px;">
            <p style="margin:0;font-size:12px;color:#888;font-family:Arial,sans-serif;">
              You received this because you expressed interest in The MAP.<br/>
              <a href="${UNSUBSCRIBE_URL}" style="color:#888;">Unsubscribe</a>
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
  return `<p style="margin:0 0 20px;font-size:16px;line-height:1.85;color:#2c2c2e;font-family:Georgia,serif;">${text}</p>`
}

function cta(text: string) {
  return `<div style="text-align:center;margin:40px 0;">
    <a href="${BOOK_URL}" style="display:inline-block;background:#7ba69b;color:#ffffff;font-family:Arial,sans-serif;font-weight:700;font-size:15px;letter-spacing:1px;text-decoration:none;padding:16px 40px;border-radius:4px;">${text}</a>
  </div>`
}

function sig() {
  return `<p style="margin:32px 0 0;font-size:16px;color:#38485d;font-family:Georgia,serif;">True</p>`
}

const EMAILS: Record<number, { subject: string; preview: string; html: string }> = {
  1: {
    subject: "You'd rather tell people you're an alcoholic",
    preview: "Than admit your anger is a problem",
    html: baseTemplate(
      "Than admit your anger is a problem",
      `${p("You'd rather tell people you're an alcoholic than admit your anger is a problem.")}
${p("It's easier to say 'I drink too much' than 'I can't control my emotions'.")}
${p("I know that sounds extreme. But I've been doing this work a long time now, and I've seen it over and over.")}
${p("A man will sit in front of me and openly talk about his drinking, his drug use, and even watching too much porn. All of it.")}
${p("But when it comes to his anger? He'll underplay it, justify it, and try to make it sound less of an issue than it is.")}
${p("They always downplay it.")}
${p("<em>&quot;It's not that bad.&quot;</em>")}
${p("<em>&quot;I just lose my temper sometimes.&quot;</em>")}
${p("<em>&quot;You should see my old man, now that's anger.&quot;</em>")}
${p("<em>&quot;It's so much better than it was before.&quot;</em>")}
${p("There's a shame around anger that doesn't exist with other things. Because somewhere along the line, you were told that a full grown man should be able to control himself.")}
${p("That you should be able to just not react. Simply calm down, and let it go.")}
${p("As if the thing that's been building inside you for 10, 20, 30 years can be fixed by taking a deep breath.")}
${p("It can't.")}
${p("And the shame that follows every time you lose your shit - every moment you see the look on your kid's face or your partner's face - that shame is doing more damage than the anger itself.")}
${p("Because it keeps you silent.")}
${p("And silence is where anger grows.")}
${p("I'm going to be talking a lot about this over the coming weeks. Not the surface level stuff. Not '10 tips to manage your temper.' The real thing underneath it.")}
${p("If any of this landed, keep your eyes on your inbox.")}
${sig()}`
    )
  },
  2: {
    subject: "You haven't raised your voice in months and you're still angry",
    preview: "Rage is loud. Anger doesn't have to be.",
    html: baseTemplate(
      "Rage is loud. Anger doesn't have to be.",
      `${p("Most people think anger looks like shouting. Smashing things up and constantly losing your shit in front of people.")}
${p("That's not anger. That's rage.")}
${p("Rage is the explosion. It's loud, visible, and everyone around you knows it's happening.")}
${p("Anger is quieter than that. And honestly, that's what makes it more dangerous.")}
${p("Anger is the tightness in your chest that you've stopped noticing because it's been there so long.")}
${p("It's the short answers you give your partner when nothing specific has happened.")}
${p("It's the low level irritation that follows you through your day like background noise.")}
${p("It's the numbness. The flatness. It's the feeling of going through the motions without knowing why everything feels so heavy.")}
${p("You can be angry for years without ever raising your voice.")}
${p("And because no one sees it, no one says anything. Including you.")}
${p("You tell yourself you're fine because you're not kicking off.")}
${p("But the anger is still there.")}
${p("Silent anger doesn't protect the people around you. It just makes the damage invisible.")}
${p("Your partner feels it even if they can't explain it. Your kids feel the energy shift even when you haven't said a word. And you feel it most of all - that quiet disconnect from a life you know should feel better than this.")}
${p("Rage burns hot and fast. Anger sits in the body and stays.")}
${p("If you've seen any of my content about anger and thought 'this isn't me because I don't lose my temper' - I'd ask you to sit with this for a moment.")}
${p("When was the last time you felt genuinely light? Not calm because you were controlling yourself. Actually light.")}
${p("If you can't remember, that's worth paying attention to.")}
${p("More soon.")}`
    )
  },
  3: {
    subject: "Your anger is not the problem",
    preview: "It's what your anger is protecting",
    html: baseTemplate(
      "It's what your anger is protecting",
      `${p("Most people think anger is the problem.")}
${p("It's not.")}
${p("Anger is the bodyguard. It's the big loud thing standing at the door making sure nobody gets to see what's behind it.")}
${p("And what is behind it? Usually sadness. Sometimes grief. Sometimes shame so deep you don't even have the words for it.")}
${p("Think about the last time you properly kicked off. Was the thing that triggered you really worth the level of reaction?")}
${p("You may have even known in the moment it wasn't, but you couldn't stop.")}
${p("That's because the reaction wasn't about what just happened. It was about something much older.")}
${p("Your nervous system took a picture of something painful a long time ago. And now every time something resembles that picture, even slightly, your system fires up.")}
${p("It doesn't care that you're a grown man now. It doesn't care that you're at the dinner table with your family or in a meeting with your colleagues. It just wants to react.")}
${p("This is why trying to think your way out of anger never works. The mind didn't create it - the body did. Which is why the body is where it needs to be met.")}
${p("Anger is not a character flaw. It's not a sign that something is wrong with you. It's your system doing what it learned to do to survive.")}
${p("The question is whether it's still serving you.")}
${p("More on this soon.")}
${sig()}`
    )
  },
  4: {
    subject: "I used to scare people",
    preview: "And I told myself it wasn't that bad",
    html: baseTemplate(
      "And I told myself it wasn't that bad",
      `${p("I used to scare people.")}
${p("Not because I wanted to - but because I had so much pain inside me that had nowhere to go, and anger was the only way to get it out.")}
${p("I came from a world where violence was normal. Where aggression was how you survived. Drugs, chaos, the whole thing. And when I started trying to build a different life, the anger came with me.")}
${p("I'd kick off over stupid things. Someone's tone. Someone looking at me in a certain way. Things that would take a normal person two seconds to forget.")}
${p("And afterwards? I felt ashamed. Embarrassed. Every single time.")}
${p("I'd tell myself it wasn't that bad. That anyone would've reacted the same way.")}
${p("But I knew.")}
${p("I knew it was me. I didn't know why, but I knew that if I didn't figure it out, I'd lose everything and everyone.")}
${p("Change came slow. It was a painful, honest look at what was underneath the anger. The hurt I'd never let myself feel. The younger version of me had built a wall of fire around himself.")}
${p("I didn't learn to manage my anger. I learned to meet the pain it was protecting.")}
${p("That's the difference between calming down and actually changing.")}
${p("And that's the work I now do with other men.")}
${p("More coming.")}
${sig()}`
    )
  },
  5: {
    subject: "What your anger is actually costing you",
    preview: "And you already know the answer",
    html: baseTemplate(
      "And you already know the answer",
      `${p("Let me ask you something and I want you to actually sit with it for a second.")}
${p("If you removed your anger from the picture completely, what would your life look like?")}
${p("Your relationship. Your kids. Your friendships. Your career. Your sleep. Your peace of mind.")}
${p("How much of it would improve if you weren't carrying this weight around?")}
${p("Maybe you already know the answer. Maybe you've known for a while. Or maybe you've not thought about it - you just accepted that this was how life feels.")}
${p("Here's what I see with the men I work with.")}
${p("They come to me and say their anger isn't that bad. Then in the same conversation they tell me they shouted at their wife last week. That people around them walk on eggshells. That their mates don't even challenge them anymore because they know what happens.")}
${p("That's not nothing.")}
${p("The cost of anger isn't just the outburst. It's the trust that slowly disappears. It's the distance that grows between you and the people who love you. And the guilt you carry silently.")}
${p("I'm going to share something with you in a few days. Something I've built specifically for men who are ready to stop paying this price.")}
${p("Keep your eyes open.")}
${sig()}`
    )
  },
  6: {
    subject: "10 men. 12 weeks. Let's go.",
    preview: "The MAP is open",
    html: baseTemplate(
      "The Anger Programme is open",
      `${p("Over the last couple of weeks I've been talking about anger. Not the surface level stuff - the real thing underneath it. The shame, the pain, the patterns that have been running the show for years.")}
${p("If any of that resonated, this email is the one that matters.")}
${p("I'm opening the doors to this year's cohort of The MAP - Men's Anger Programme.")}
${p("<strong style='color:#38485d;'>10 spots. That's it.</strong>")}
${p("This is not anger management. I'm not going to teach you breathing techniques and send you on your way. This is 12 weeks of deep, structured work to understand where your anger actually comes from and dismantle it at the root.")}
${p("<strong style='color:#38485d;'>Pillar 1: Self Exploration</strong><br/>We start by looking at how you see yourself. Because your outer world - your reactions, your triggers, all of it - is a reflection of your inner world. You'll begin to understand why you act and react to life the way you do. Why certain things hit you harder than they should. We create distance between the true you and the conditioned parts of you that have been running the show.")}
${p("<strong style='color:#38485d;'>Pillar 2: Self Discovery</strong><br/>This is where we get out of your head and into your body. Your mind has compartmentalised the pain away. You think it's dealt with. But your body hasn't forgotten. Somatic work, nervous system recalibration, connecting to the parts of yourself you didn't know were there. The parts holding you back, and the parts needed to take you forward.")}
${p("<strong style='color:#38485d;'>Pillar 3: Personal Blueprint</strong><br/>We don't just clear out the old. We build the new. Whether it's your relationships, your career, your emotional control, or all of it - we work towards the life you actually want from a place that is fully aligned with who you are.")}
${p("The investment is £333 per month for 12 weeks.")}
${p("If you're reading this and something in you is saying 'this is for me' - trust that.")}
${cta("Book Your Call")}
${p("We'll have a real conversation. There is zero pressure. I'll ask you some questions, you'll ask me some, and we'll both know if it's right.")}
${p("10 spots.")}
${sig()}`
    )
  },
  7: {
    subject: '"I can manage it myself"',
    preview: "That's what I said too",
    html: baseTemplate(
      "That's what I said too",
      `${p("If you read my last email about The MAP and your first thought was 'I can manage it myself' - I get it.")}
${p("I said the same thing. For years.")}
${p("And to be fair, you probably can manage it. For a while. You can keep it together in public, and when you don't you can apologise after. You can tell yourself it's getting better.")}
${p("But managing something is not the same as being free of it.")}
${p("Managing means the thing is still there, you're just holding it in place.")}
${p("You know the difference between a day where you feel genuinely calm and a day where you're just keeping the lid on.")}
${p("On the calm days, life is different. Your patience, the way you speak to people, even the way you carry yourself changes.")}
${p("That's not managing. That's what it feels like when the weight isn't there.")}
${p("The MAP is designed to get you to that place permanently - 12 weeks of work that helps you actually put the weight down. No short-term tricks.")}
${p("Somatic work, nervous system recalibration, getting into the body where the real patterns live. Not just talking about it. Feeling it, processing it, and letting it go.")}
${p("I'm not for everyone. I'm direct, I'll challenge you, and I won't let you hide behind the story you've been telling yourself. But if you're ready for that, the shifts are real.")}
${p("There are 10 spots. Some have already gone.")}
${cta("Book Your Call")}
${sig()}`
    )
  },
  8: {
    subject: "You're not the only man carrying this",
    preview: "You just think you are",
    html: baseTemplate(
      "You just think you are",
      `${p("One of the things that stops men from doing this work is the idea of doing it around others.")}
${p("I get it.")}
${p("You've spent years making sure no one sees what's really going on. The thought of sitting in a room - even a virtual one - and being honest about your anger in front of strangers feels like the opposite of safe.")}
${p("But what I've learned from doing this work is that the moment a man hears another man say the thing he's been carrying silently, something shifts.")}
${p("Not because it fixes anything instantly. But because the shame loses its grip when you realise you're not the only one.")}
${p("You might think your anger makes you different - the way you react, the guilt afterwards, the pattern you can't seem to break. You think that's just you.")}
${p("It's not.")}
${p("Every man in that room is carrying a version of the same thing. Different details, same weight.")}
${p("And there's something that happens between men when the mask drops and the truth comes out. A respect builds that doesn't exist in normal life. Because you've seen each other without the mask and you didn't judge.")}
${p("That's not something I can explain on a page. It's something you feel when you're in it.")}
${p("This isn't group therapy where you sit in a circle and talk about your feelings for an hour. This is structured, deep, guided work - somatic practices, nervous system work, real tools. But it happens alongside men who are in it with you. And that changes the experience completely.")}
${p("You don't have to be ready to share your life story on day one. You just have to be willing to show up honestly.")}
${p("The men who do this work together hold each other to a standard that no amount of solo effort can match. Not because we pressure each other, but because we inspire each other.")}
${p("There are a few spots left.")}
${cta("Book Your Call")}
${sig()}`
    )
  },
  9: {
    subject: "Last call",
    preview: "The remaining spots won't be here long",
    html: baseTemplate(
      "The remaining spots won't be here long",
      `${p("Short one today.")}
${p("The MAP has limited spots remaining.")}
${p("12 weeks. Deep work. The kind that changes how you respond to life, not just how you cope with it.")}
${p("If you've been reading these emails and recognising yourself in them, you already know whether this is for you.")}
${p("The question isn't whether you need it. The question is whether you're going to do what you've always done - tell yourself you'll sort it on your own, wait until the next blowup, and then feel that same shame again.")}
${p("Or whether this is the moment you decide to actually deal with it.")}
${p("No one's coming to save you from this. No one can do the work for you. But you don't have to figure it out alone either.")}
${p("£333 per month. 12 weeks. A conversation to start.")}
${cta("Book Your Call - Last Spots")}
${p("I'll see you on the other side of it.")}
${sig()}`
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { emailNumber, testEmail } = await request.json()

    if (!emailNumber || !EMAILS[emailNumber]) {
      return NextResponse.json({ error: 'Invalid email number (1-9)' }, { status: 400 })
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
        await new Promise(r => setTimeout(r, 100))
      } catch (err: unknown) {
        errors.push(`${sub.email}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

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
