def get_paths(json, nRepo):
    try:
        json.get('path', None)
        stub = json.get('path')
        if nRepo.get(json.get('path'), None):
            next
        else:
            print settings.LIBRARY_PATH
            path = os.path.join(settings.LIBRARY_PATH, stub)
            page_data = db.L(path).grabData()
            nRepo[stub] = page_data
    except:
        print('here1')
        print('here2')
        for item in json:
            try:
                isinstance(json.get(item, None), dict)
                get_paths(json.get(item), nRepo)
            except:
                next 
                
            try:
                isinstance(json.get(item, None), list)
                for item in json.get(item, None):
                    get_paths(item, nRepo)
            except:
                next 
