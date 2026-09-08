"""CSRF token comparison helpers (stdlib only)."""

import hmac


def tokens_match(expected, provided):
    if not expected or not provided:
        return False
    return hmac.compare_digest(str(expected), str(provided))


def token_from_request(form, headers):
    form_token = ""
    if form is not None:
        form_token = str(form.get("csrf_token") or "").strip()
    header_token = ""
    if headers is not None:
        header_token = str(headers.get("X-CSRF-Token") or headers.get("X-Csrf-Token") or "").strip()
    return form_token or header_token


def wants_json_response(headers):
    if not headers:
        return False
    if str(headers.get("X-Requested-With") or "") == "XMLHttpRequest":
        return True
    accept = str(headers.get("Accept") or "")
    content_type = str(headers.get("Content-Type") or "")
    return "application/json" in accept or "application/json" in content_type
