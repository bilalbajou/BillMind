<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Verify your email address for BillMind</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F9FAFB; padding-bottom: 60px; padding-top: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid #F3F4F6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
        .header { padding: 40px 40px 20px; text-align: center; }
        .header img { height: 48px; width: auto; }
        .content { padding: 20px 40px 40px; text-align: center; }
        .title { color: #111827; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px; }
        .text { color: #4B5563; font-size: 16px; line-height: 24px; margin-bottom: 32px; }
        .button-container { margin-bottom: 32px; }
        .button { background-color: #4F46E5; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; line-height: 50px; text-align: center; text-decoration: none; width: 100%; max-width: 250px; }
        .footer { padding-top: 24px; border-top: 1px solid #E5E7EB; text-align: left; }
        .footer-text { color: #6B7280; font-size: 14px; line-height: 20px; margin-bottom: 16px; }
        .sub { font-size: 12px; color: #9CA3AF; line-height: 18px; margin-top: 40px; text-align: center; }
        .url-link { color: #4F46E5; word-break: break-all; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <!-- Using a placeholder logo or text if BillMind image is not publicly hosted, but we can assume an absolute URL or cid later. We'll use styled text for now to be safe in emails -->
                <h1 style="color: #4F46E5; font-size: 28px; font-weight: 800; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    @if(file_exists(public_path('logo.png')))
                        <img src="{{ $message->embed(public_path('logo.png')) }}" alt="BillMind" style="height: 96px; width: auto;" />
                    @else
                        <span style="background-color: #4F46E5; color: white; border-radius: 8px; padding: 4px 8px; font-size: 20px; font-weight: bold;">B</span>
                        BillMind
                    @endif
                </h1>
            </div>
            
            <div class="content">
                <h2 class="title">Verify your email address</h2>
                
                <p class="text">
                    Hi there,<br><br>
                    Thanks for joining BillMind! We're excited to have you on board.
                    Before you can start managing your invoices with AI, please verify your email address by clicking the button below.
                </p>

                <div class="button-container">
                    <a href="{{ $url }}" class="button" target="_blank">Verify Email Address</a>
                </div>

                <div class="footer">
                    <p class="footer-text">
                        If you're having trouble clicking the "Verify Email Address" button, copy and paste the URL below into your web browser:
                        <br><br>
                        <a href="{{ $url }}" class="url-link">{{ $url }}</a>
                    </p>
                    <p class="footer-text" style="margin-top: 24px; margin-bottom: 0;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
        
        <p class="sub">
            &copy; {{ date('Y') }} BillMind. All rights reserved.<br>
            Fès, Morocco
        </p>
    </div>
</body>
</html>
