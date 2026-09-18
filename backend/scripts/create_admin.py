"""One-off local helper: hash a password for a new admin account.

There's no self-serve signup endpoint on purpose (only 2 admins ever exist).
Run this locally, then paste the printed document into MongoDB Atlas's
Data Explorer under the `admin_users` collection.
"""

import getpass
import sys


def main() -> None:
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("Passwords do not match.", file=sys.stderr)
        sys.exit(1)

    from werkzeug.security import generate_password_hash

    password_hash = generate_password_hash(password)

    print("\nPaste this document into Atlas (detangle_db.admin_users):\n")
    print("{")
    print(f'  "email": "{email}",')
    print(f'  "password_hash": "{password_hash}"')
    print("}")


if __name__ == "__main__":
    main()
