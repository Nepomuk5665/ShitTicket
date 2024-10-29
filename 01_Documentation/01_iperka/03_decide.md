# How we made decisions for the Shitticket project
* Working in a small team (Nepomuk and Inaam) meant that decision-making was collaborative but streamlined.
* It’s essential to document key decisions, both for tracking progress and for future reference.

## Decision log
* **Decision:** Use Microsoft To Do and GitHub issues for task management.
  * **Reason:** Combining both platforms allows for easy personal tracking (Microsoft To Do) and collaborative project tracking (GitHub issues).
  * **Date:** 10.09.2024
* **Decision:** Use Firebase for backend storage.
  * **Reason:** Firebase provides seamless integration with our frontend and is easier to set up and maintain than alternatives like AWS or Azure for small projects.
  * **Date:** 25.08.2024
* **Decision:** Choose Stripe for payment integration.
  * **Reason:** Stripe is user-friendly, has extensive documentation, and allows for easy global payments with lower fees compared to other options.
  * **Date:** 18.08.2024
* **Decision:** Develop the website using VS Code.
  * **Reason:** VS Code is lightweight, easy to customize, and supports various extensions that aid in web development (such as Firebase tools).
  * **Date:** 22.08.2024
* **Decision:** Use Hostinger for hosting.
  * **Reason:** Hostinger offers affordable, reliable hosting with good support for the size and scope of our project.
  * **Date:** 27.08.2024
* **Decision:** Use Firebase hosting instead of Hostinger
  * **Reason:** Firebase hosting is way easier to deploy than Hostinger.
  * **Date:** 05.10.2024

## Decision matrix
* One of the main decisions we had to make was how to handle task management—whether to use **only GitHub issues** or combine it with **Microsoft To Do** for individual task tracking. Our motivation was to balance ease of use and collaboration. The matrix below shows how we made this decision.

| Criteria              | Weighting | GitHub issues (score/result) | Microsoft To Do + GitHub (score/result) |
|-----------------------|-----------|------------------------------|------------------------------------------|
| Collaboration ease    | 40%       | 2 / 0.8                      | 3 / 1.2                                  |
| Personal task tracking| 30%       | 1 / 0.3                      | 3 / 0.9                                  |
| Resource management   | 30%       | 3 / 0.9                      | 2 / 0.6                                  |
| **Total**             | **100%**  | **2.0**                      | **2.7**                                  |

We decided to combine both **Microsoft To Do** and **GitHub Issues** because it scored higher overall and met our needs for both personal and collaborative task management.

### Criteria
* **Collaboration ease:** Which To Do list is easier to use and to manage personal task lists within the same system?
* **Personal task tracking:** Which To Do list allows for an easier management of daily tasks on an individual level?
* **Resource management:** Which To Do list has a simpler resource organization and cannot become inconvenient for personal tracking?

### Scoring
* 0 = Not present
* 1 = Below expectations
* 2 = Meets expectations
* 3 = Exceeds expectations
