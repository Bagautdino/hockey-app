"""Add video_url column and make s3_key nullable.

Revision ID: 001
Revises:
Create Date: 2026-04-16
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("videos", sa.Column("video_url", sa.String(1000), nullable=True))
    op.alter_column("videos", "s3_key", existing_type=sa.String(500), nullable=True)


def downgrade() -> None:
    op.alter_column("videos", "s3_key", existing_type=sa.String(500), nullable=False)
    op.drop_column("videos", "video_url")
