# BGM Email Templates

Modern, responsive email templates designed to match the Believers Glorious Ministry website design theme. These templates are optimized for email clients across all devices and platforms.

## 🎨 Design Features

- **Glass Morphism Effects**: Subtle gradients and transparency using email-safe CSS
- **BGM Blue Color Scheme**: Consistent with website design (`#1f8ef1`)
- **Modern Typography**: Georgia for headings, Arial for body text
- **Responsive Design**: Mobile-first with breakpoints at 600px and 480px
- **Email Client Compatibility**: Table-based layouts, inline styles, Outlook-safe CSS

## 📧 Available Templates

### 1. Devotional Email (`devotional.html`)
Perfect for daily spiritual content delivery.

**Template Variables:**
- `{{ title }}` - Devotional title
- `{{ bible_verse }}` - Scripture verse to highlight
- `{{ reflection }}` - Main reflection content
- `{{ prayer }}` - Prayer content
- `{{ application_tip }}` - Practical application advice
- `{{ closing_thought }}` - Final encouraging thought
- `{{ link }}` - CTA button URL

### 2. Welcome Email (`welcome.html`)
Simple, focused welcome email for post-registration confirmation.

**Template Variables:**
- `{{ user.first_name }}` - Recipient's first name
- `{{ website_url }}` - Link to church platform

### 3. Sermon Email (`sermon.html`)
Announce new sermon uploads and preaching content.

**Template Variables:**
- `{{ title }}` - Sermon title
- `{{ preacher }}` - Preacher name
- `{{ description }}` - Sermon description
- `{{ link }}` - Listen/download URL
- `{{ sermon_series }}` - Optional series name
- `{{ sermons_url }}` - Link to all sermons
- `{{ website_url }}` - Main website link
- `{{ unsubscribe_url }}` - Unsubscribe link

### 4. Event Notification (`event-notification.html`)
Special event announcements with RSVP functionality.

**Template Variables:**
- `{{ title }}` - Event title
- `{{ event_date }}` - Event date
- `{{ event_time }}` - Event time (optional)
- `{{ event_location }}` - Event location (optional)
- `{{ description }}` - Event description
- `{{ link }}` - RSVP/Event details URL
- `{{ website_url }}` - Main website link

### 5. Announcement Email (`announcement.html`)
General announcements for special services, important updates, etc.

**Template Variables:**
- `{{ announcement_title }}` - Main announcement headline
- `{{ announcement_subtitle }}` - Supporting subtitle
- `{{ main_message }}` - Primary message content
- `{{ event_date }}` - Event date (optional)
- `{{ event_time }}` - Event time (optional)
- `{{ event_location }}` - Event location (optional)
- `{{ primary_cta_url }}` - Main call-to-action URL
- `{{ primary_cta_text }}` - CTA button text
- `{{ secondary_cta_url }}` - Secondary CTA URL (optional)
- `{{ secondary_cta_text }}` - Secondary CTA text (optional)
- `{{ website_url }}` - Website link
- `{{ unsubscribe_url }}` - Unsubscribe link

## 🚀 Usage Instructions

### 1. Customization
- Replace `{{ variable }}` placeholders with actual content
- Update image URLs (currently using `https://your-domain.com/BGM.png`)
- Modify colors if needed (search for `#1f8ef1` for primary blue)
- Adjust logo dimensions as needed

### 2. Image Assets
Before using templates, ensure these images exist:
- `/BGM.png` - Ministry logo (80x80px suggested)

### 3. Email Service Integration
- **Mailchimp**: Copy HTML into template editor
- **SendGrid**: Use dynamic templates with Handlebars
- **Custom SMTP**: Replace variables server-side
- **Gmail/Postmark**: Direct HTML injection

### 4. Testing
Always test emails before sending:
- **Mobile**: iPhone, Android (Gmail app, Outlook app)
- **Desktop**: Gmail, Outlook, Apple Mail
- **Web**: Various browsers
- **Tools**: Mailchimp email tester, Litmus, Email on Acid

## 🎯 Best Practices

### Content Optimization
- **Subject Lines**: 50 characters max, include urgency/curiosity
- **Preheader Text**: Use first 100 characters for preview
- **Personalization**: Use recipient names where possible
- **CTA Buttons**: Clear, action-oriented text

### Email Design
- **Images**: Always include alt text, optimize file sizes (<100KB)
- **Fonts**: Use web-safe fonts with fallbacks
- **Colors**: Ensure good contrast ratios for accessibility
- **Spacing**: Ample white space for mobile readability

### Technical Considerations
- **HTML Tables**: Essential for email layout compatibility
- **Inline CSS**: Most email clients strip `<style>` tags
- **Media Queries**: Support varies; mobile-first approach works best
- **Outlook Compatibility**: Test thoroughly, use fallbacks for complex CSS

## 🛠️ Customization Guide

### Color Scheme
```css
Primary Blue: #1f8ef1
Secondary Blue: #1a73e8
Dark Text: #2c3e50
Body Text: #34495e
Muted Text: #7f8c8d
```

### Banner Types (Announcement Template)
- `event-banner` - Orange gradient (#f39c12 to #e67e22)
- `hero-banner` - Red gradient (#e74c3c to #c0392b)
- `special-banner` - Green gradient (#27ae60 to #229954)

### Font Families
- Headings: `'Georgia', 'Times New Roman', serif`
- Body: `'Arial', 'Helvetica', sans-serif`

## 📱 Responsive Behavior

### Breakpoints
- **Desktop**: >600px (full layout)
- **Tablet/Mobile**: ≤600px (stacked elements, smaller text)
- **Small Mobile**: ≤480px (further optimizations)

### Mobile Optimizations
- Buttons become full-width
- Text sizes reduce appropriately
- Margins and padding adjust for smaller screens
- Elements stack vertically for better thumb navigation

## 🔧 Troubleshooting

### Common Issues
1. **Images not loading**: Verify absolute URLs and image hosting
2. **Buttons not clicking**: Remove any CSS `pointer-events` rules
3. **Spacing issues**: Email clients handle padding differently
4. **Font rendering**: Always include fallback fonts

### Email Client Specific
- **Gmail**: Strips some CSS; use inline styles and `!important`
- **Outlook**: Limited CSS support; use table fallbacks
- **Apple Mail**: Good CSS support; templates work well
- **Mobile Apps**: Test each major email app separately

## 📞 Support

For template customization or additional template requests:
- Contact your development team
- Reference this README for usage guidelines
- Test thoroughly before mass distribution

---

**Built for Believers Glorious Ministry** - Bringing faith and technology together for meaningful connections in our community.
