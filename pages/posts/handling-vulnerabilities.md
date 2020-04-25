title: Handling Vulnerability Reports
published: 2020/04/24

---

Below is a document detailing how to interact with security researchers who submit vulnerability reports to your company.

---

When hosting a website exposed to the internet, it is expected that security researchers will run automated tools against our website and occasionally do some manual investigation. We take security seriously at CompanyName, but unfortunately for us, all code is a liability and a potential vulnerability. We do not actively audit our application and a result of this, we assume there are vulnerabilities.

We take reported security issues seriously. Every report is treated as high priority until it is either resolved, or deemed a non-issue. We understand the hard work that goes into security research and have a deep respect for the industry as well as the responsible individuals who report vulnerabilities responsibly.

The playbook for handling reported security vulnerabilities is as follows:

1. Immediately reply to the reporter with the following:

> Dear XXX,

> Thanks for reporting this vulnerability. We are actively investigating your report and will update you within the next 12 hours.

> As part of our investigation, we ask all security researchers to provide us with a) any IPs used to trigger the vulnerability b) timestamps associated with the triggered vulnerability c) company you are associated with and d) any further information you believe may help us resolve the issue.

> We maintain a public list of security researchers who have contributed reports at https://github.com/company-name/security-researchers and would love to add you to this list. If you agree, could you please provide a) your full name b) proffered email address c) any social media you wish to have attached.

> Thanks again for this report and we'll be in touch shortly.

> Kind regards,
<name>

Feel free to insert any requests for specific information that may help with recreating the vulnerability.

We want to maintain a secure and private business, so any work that others do to help us, we are grateful for. In this correspondence, you are acting as a spokesperson for CompanyName - as a guideline if the reply was leaked to the press, we should be comfortable with how we have represented the company.

2. Treating the report as high priority, identify the security risk. For example bypassing login processes, injection attacks, RCEs or triggering actions on behalf of another user should be considered critical. Otherwise, it is up to the investigator to determine severity.

3. Recreate the issue (ideally against a production environment).

4. If the vulnerability is valid and considered an issue, it should be patched immediately.

5. Update the reporter with the status of the investigation. At this point, the status should either be "confirmed and patched" or "non-issue". In the case of "confirmed and patched", update the researcher on the implementation of the patch. In the case of "non-issue", let the researcher know that we do not believe the issue to have potential to affect our business. It is important to be humble when corresponding with the researcher, and always err on the side of clarifying instead of asserting. Finally, as is often the case, we may have confirmed the issue, but deemed it non-urgent. As a result, it is important to let the researcher know that we have confirmed the issue, and added it to our roadmap accordingly.

6. If possible, shoot some swag the researchers way! A t-shirt goes a long way.
