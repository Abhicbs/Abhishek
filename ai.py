import google.generativeai as genai
import base64
import os

# Configure the API
genai.configure(api_key="AIzaSyD3HhN5hAns_2Z_aK1tPHeb0UWGREP2HQo")

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash')


def _load_portfolio_content():
    """
    Load text content from the main portfolio HTML files so the AI
    can answer questions based on the website as well as the resume.
    """
    files = [
        "index.html",
        "portfolio-details.html",
        "service-details.html",
        "starter-page.html",
    ]
    chunks = []
    for path in files:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    chunks.append(f"\n--- {path} ---\n" + f.read())
            except Exception:
                # If any file fails to load, skip it silently
                continue
    return "\n".join(chunks)


PORTFOLIO_CONTENT = _load_portfolio_content()


def ask_abhi_ai(question):
    try:
        # Path to the resume PDF
        pdf_path = "Abhishek Yadav (Resume)1.pdf"

        # Read the PDF file
        with open(pdf_path, "rb") as f:
            pdf_content = f.read()

        # Encode the PDF content
        pdf_base64 = base64.b64encode(pdf_content).decode("utf-8")

        # High‑level instructions for the assistant
        system_instructions = (
            "You are Abhishek Yadav's personal AI assistant. "
            "Answer questions using ONLY the information from his resume PDF "
            "and the portfolio website content provided here. "
            "If something is not present in these sources, say you don't know "
            "instead of guessing. Keep answers concise, clear and polite."
        )

        # Combine the portfolio HTML content as additional context
        portfolio_text = (
            "Here is Abhishek's portfolio website content (HTML):\n"
            f"{PORTFOLIO_CONTENT[:50000]}"  # trim in case it is very long
        )

        # Build the full set of parts for the model
        parts = [
            system_instructions,
            portfolio_text,
            {
                "mime_type": "application/pdf",
                "data": pdf_base64,
            },
            "User question: " + question,
        ]

        # Generate response
        response = model.generate_content(parts)

        return response.text
    except Exception as e:
        return f"An error occurred: {str(e)}"
