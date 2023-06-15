'''
CEE websocket application backend
'''
import asyncio
import json
import random
import websockets

ANIMALS = list(map(lambda x: x.replace('\n', '').strip(), open("animals.txt").readlines()))
USERS = {}
DOC_STATE = {"content": {"ops": []}, "text": "", "fileName" : ""}

def state_event():
    '''
    Preparing document state
    '''
    return json.dumps({"type": "text", **DOC_STATE})

def users_event(websocket):
    '''
    Preparing users' status
    '''
    res = []
    for i in USERS:
        if i != websocket:
            res.append(USERS[i])
    return json.dumps({"type": "users", "users": res, "mydata": USERS[websocket]})


async def broadcast_state():
    '''
    Broadcast document state
    '''
    if USERS:
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])

async def broadcast_users():
    '''
    Broadcast users' status
    '''
    if USERS:
        await asyncio.wait([user.send(users_event(user)) for user in USERS])

async def broadcast_delta(data, websocket):
    '''
    Broadcast delta information
    '''
    info = json.dumps({"type": "delta", "content": data["delta"], "real": data["real"], "fileName": data["fileName"]})
    loader = []
    for user in USERS:
        if user != websocket:
            loader += [user.send(info)]
    if loader:
        await asyncio.wait(loader)

async def register(websocket):
    '''
    Add a user when he/she joins
    '''
    USERS[websocket] = {
        'name': 'Anonymous {}'.format(random.choice(ANIMALS)),
        'position': {'index': 0, 'length': 0},
        'color': '#{:2x}{:2x}{:2x}'.format(
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255)
        ).replace(' ', '0'),
        'fileName': ''
    }

async def unregister(websocket):
    '''
    Remove a user when he/she leaves
    '''
    USERS.pop(websocket, None)
    await broadcast_users()

async def texteditor(websocket, _):
    '''
    A text editor websocket application
    '''
    print('A user has connected to the server')
    await register(websocket)
    try:
        await websocket.send(state_event())
        await broadcast_users()
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "move":
                # Updating cursor position and tell others about it
                USERS[websocket]['position'] = data["position"]
                USERS[websocket]['fileName'] = data["fileName"]
                print(data)
                await broadcast_users()
            elif data["action"] == "write":
                # Handling cursor movement because of write
                # Updating data
                DOC_STATE["content"] = data["content"]
                DOC_STATE["fileName"] = data["fileName"]
                print(data)
                # Tell USERS
                await broadcast_delta(data, websocket)
    finally:
        print('A user has left the server')
        await unregister(websocket)

SERVER = websockets.serve(texteditor, "0.0.0.0", 6789)

asyncio.get_event_loop().run_until_complete(SERVER)
asyncio.get_event_loop().run_forever()
