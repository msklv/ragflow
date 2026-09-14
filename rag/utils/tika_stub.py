#
#  Copyright 2026 The InfiniFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

"""Stub for the legacy tika-based ``.doc`` parse path.

``tika-server`` (and the JVM it needs) was removed from the image to cut its
size and attack surface, so the Python parse paths no longer have a backend
for legacy binary ``.doc`` (Word 97-2003). Every former ``from tika import
parser`` call site now reports the format as unsupported through this stub.

The Go parse path is unaffected: ``internal/parser/parser/doc_parser.go``
parses the ``.doc`` family natively via ``office_oxide``. Convert ``.doc`` to
``.docx`` to ingest it through the Python paths.
"""

import logging

UNSUPPORTED_DOC_MESSAGE = "Unsupported .doc parsing: the tika backend is not available in this image."


def report_unsupported_doc(callback=None, filename: str = "") -> None:
    """Report that a legacy binary ``.doc`` cannot be parsed.

    Callers return an empty result after calling this, matching the previous
    "tika not available" behaviour.
    """
    message = f"{UNSUPPORTED_DOC_MESSAGE} File: {filename}." if filename else UNSUPPORTED_DOC_MESSAGE
    if callback is not None:
        callback(0.8, message)
    logging.warning(message)
