from nintendo.nex import backend, settings
from nintendo import nnas
import anyio
from asgiref.sync import async_to_sync

import logging
logging.basicConfig(level=logging.INFO)

TITLE_ID = 0x000500301001600A
TITLE_VERSION = 0

@async_to_sync
async def token(
    DEVICE_ID, SERIAL_NUMBER, SYSTEM_VERSION,
    REGION_ID, COUNTRY_NAME, LANGUAGE,
    USERNAME, PASSWORD, CERT
):
    try:
        nas = nnas.NNASClient()
        nas.set_device(DEVICE_ID, SERIAL_NUMBER, SYSTEM_VERSION, CERT)
        nas.set_title(TITLE_ID, TITLE_VERSION)
        nas.set_locale(REGION_ID, COUNTRY_NAME, LANGUAGE)

        access_token = await nas.login(USERNAME, PASSWORD)
        service_token = await nas.get_service_token(access_token.token, "87cd32617f1985439ea608c2746e4610")

        return service_token
    except Exception as e:
        print(f"Server {hex(TITLE_ID)} down!")
        logging.exception(e)
        return False
