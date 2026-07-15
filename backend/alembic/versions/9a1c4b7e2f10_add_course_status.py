"""add course_status

Revision ID: 9a1c4b7e2f10
Revises: 32778a26a08c
Create Date: 2026-07-15 10:00:00.000000

"""
from datetime import datetime
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a1c4b7e2f10'
down_revision: Union[str, None] = '32778a26a08c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    course_status = op.create_table(
        'course_status',
        sa.Column('course_code', sa.String(length=32), nullable=False),
        sa.Column('is_suspended', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_course_status_course_code'),
        'course_status',
        ['course_code'],
        unique=True,
    )

    now = datetime.utcnow()
    op.bulk_insert(
        course_status,
        [
            {
                'id': str(uuid4()),
                'course_code': course_code,
                'is_suspended': False,
                'message': None,
                'created_at': now,
                'updated_at': now,
            }
            for course_code in ('MLN111', 'MLN122')
        ],
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_course_status_course_code'), table_name='course_status')
    op.drop_table('course_status')
