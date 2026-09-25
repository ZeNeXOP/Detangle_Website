"""Best-effort notifications for new booking requests.

Both channels are optional and independent: whichever env vars are set,
that channel fires; whichever aren't, it's skipped with a warning instead
of failing the request. A booking always saves successfully regardless of
whether either notification actually goes out — these are a courtesy to
Noopur, not something the visitor's request should ever fail on.

Email: Resend (https://resend.com) — RESEND_API_KEY, NOTIFY_EMAIL_FROM, NOTIFY_EMAIL_TO
WhatsApp: Twilio WhatsApp Business API — TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
          TWILIO_WHATSAPP_FROM, NOTIFY_WHATSAPP_TO
          (Twilio's WhatsApp API requires an approved sender + template for
          business-initiated messages outside the sandbox — see Docs/Setup.md.)
"""

import os

import requests

RESEND_API_URL = "https://api.resend.com/emails"
TWILIO_API_URL_TEMPLATE = "https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"


def send_booking_email(subject: str, text_body: str, reply_to: str | None = None) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    from_address = os.getenv("NOTIFY_EMAIL_FROM")
    to_address = os.getenv("NOTIFY_EMAIL_TO")

    if not api_key or not from_address or not to_address:
        print(
            "notifications: skipping email - RESEND_API_KEY, NOTIFY_EMAIL_FROM or "
            "NOTIFY_EMAIL_TO is not set."
        )
        return

    payload = {
        "from": from_address,
        "to": [to_address],
        "subject": subject,
        "text": text_body,
    }
    if reply_to:
        # Lets Noopur just hit Reply in her inbox to email the customer directly.
        payload["reply_to"] = reply_to

    try:
        response = requests.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        if not response.ok:
            print(f"notifications: Resend email failed ({response.status_code}): {response.text}")
    except requests.RequestException as error:
        print(f"notifications: Resend email failed: {error}")


def send_booking_whatsapp(body: str) -> None:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_FROM")
    to_number = os.getenv("NOTIFY_WHATSAPP_TO")

    if not account_sid or not auth_token or not from_number or not to_number:
        print(
            "notifications: skipping WhatsApp - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, "
            "TWILIO_WHATSAPP_FROM or NOTIFY_WHATSAPP_TO is not set."
        )
        return

    try:
        response = requests.post(
            TWILIO_API_URL_TEMPLATE.format(sid=account_sid),
            auth=(account_sid, auth_token),
            data={
                "From": f"whatsapp:{from_number}",
                "To": f"whatsapp:{to_number}",
                "Body": body,
            },
            timeout=10,
        )
        if not response.ok:
            print(f"notifications: Twilio WhatsApp failed ({response.status_code}): {response.text}")
    except requests.RequestException as error:
        print(f"notifications: Twilio WhatsApp failed: {error}")


def notify_new_service_booking(*, service_label: str, full_name: str, email: str, phone: str, notes: str) -> None:
    subject = f"New booking request: {service_label}"
    lines = [
        f"Service: {service_label}",
        f"Name: {full_name}",
        f"Email: {email}",
        f"Phone: {phone}",
    ]
    if notes:
        lines.append(f"Notes: {notes}")
    body = "\n".join(lines)

    send_booking_email(subject, body, reply_to=email)
    send_booking_whatsapp(f"New booking request — {service_label}\n\n{body}")
