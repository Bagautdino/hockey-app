"""Add email, hockey_start_date, photo_key to players"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("players", sa.Column("email", sa.String(255), nullable=True))
    op.add_column("players", sa.Column("hockey_start_date", sa.Date(), nullable=True))
    op.add_column("players", sa.Column("photo_key", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("players", "photo_key")
    op.drop_column("players", "hockey_start_date")
    op.drop_column("players", "email")
