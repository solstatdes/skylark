import numpy as np
from scipy import interpolate
import os
import db

class Stack():

    def __init__(self, project, library_path, new_path=None):
        self.project = project
        self.library_path = library_path
        self.repo = {}
        self.get_paths(project)
        self.N = self.N_interp(self.get_limits())

    def N_interp(self, wlRange):
        N = {}
        N['x'] = np.linspace(min(wlRange), max(wlRange), 200)
        for item in self.repo.keys():
            n = np.array(self.repo.get(item).get('n', None))
            k = np.array(self.repo.get(item).get('k'))
            try:
                len(k)
            except:
                k = np.array([0]*(len(n)))
            x = np.array(self.repo.get(item).get('x'))
            fn = interpolate.interp1d(x, n)
            fk = interpolate.interp1d(x, k)
            N[item] = {'n': list(fn(N.get('x'))), 'k': list(fk(N.get('x')))}
        N['x'] = list(N['x'])
        return N

    def get_limits(self):
        mins = []
        maxs = []
        keys = self.repo.keys()
        for item in keys:
            mins.append(min(self.repo.get(item).get('x')))
            maxs.append(max(self.repo.get(item).get('x')))
        return [max(mins), min(maxs)]

    def get_paths(self, json):
        if json.get('path', None):
            stub = json.get('path')
            if self.repo.get(json.get('path'), None):
                next
            else:
                path = os.path.join(self.library_path, stub)
                page_data = db.L(path.replace('!!', ' ')).grabData()
                self.repo[stub] = page_data
        else:
            for item in json:
                if isinstance(json.get(item), dict):
                    try:
                        self.get_paths(json.get(item))
                    except:
                        continue
                elif isinstance(json.get(item), list):
                    for item in json.get(item):
                        self.get_paths(item)
        

