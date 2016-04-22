import yaml
import json

class L:

    def __init__(self, path):
        self.data = []
        self.path = path
        self.page = self.grabYml()

    def grabYml(self):
        with open(self.path, 'r') as f:
            page = yaml.load(f)
        return page 
        
    def grabData(self):
        for item in self.page.get('DATA', None):
            type = item.get('type', None)
            if type == 'tabulated nk':
                data = self.tbnk(item.get('data', None)) 
                return data

    def tbnk(self, data):
        data = data.split('\n')
        data.pop()
        data = [row.split(' ') for row in data]
        data_dict = {}
        data_dict['x'] = [float(row[0]) for row in data]
        data_dict['n'] = [float(row[1]) for row in data]
        data_dict['k'] = [float(row[2]) for row in data]

        return data_dict
        
    def dummy():
        count = 0
        if flag:
            for item in self.page.get('DATA'):
                if item['type']=='tabulated k':
                    data = list(self.tbk(item['data']))
                    N = self.N
                    self.x_data = data[0]
                    self.N = len(data[0])
                    new_data = self.data(key,flag=False)
                    data.insert(1, list(new_data[1]))
                    self.N = N
                    self.x_data = None
                    return data

        for item in page['DATA']:
             if item['type'] == 'formula 1':
                 data = []
                 data = self.f1(item['coefficients'], item['range'])
             elif item['type'] == 'formula 2':
                 data = []
                 data = self.f2(item['coefficients'], item['range'])
             elif item['type'] == 'formula 3':
                 data = []
                 data = self.f3(item['coefficients'], item['range'])
             elif item['type'] == 'formula 4':
                 data = []
                 data = self.f4(item['coefficients'], item['range'])
             elif item['type'] == 'formula 5':
                 data = []
                 data = self.f5(item['coefficients'], item['range'])
             elif item['type'] == 'tabulated nk':
                 data = []
                 data = self.tbnk(item['data'])
             else:
                 return "Can't do this yet"
             return data
    def f1(self, coeffs, wlrange):
        coeffs = map(float, coeffs.split())
        wlrange = map(float, wlrange.split())
        if self.x_data:
            x = self.x_data
        else:
            x = linspace(wlrange[0], wlrange[1],self.N)
        n = []
        for i in range(0, self.N):
            sum = 0
            for j in range(1, len(coeffs)-1,2):
                sum += (coeffs[j]*x[i]**2)/(x[i]**2 - coeffs[j+1]**2)
            sum += coeffs[0]
            n.append(sqrt(sum+1))
        return x, n

    def f2(self, coeffs, wlrange):
        coeffs = map(float, coeffs.split())
        wlrange = map(float, wlrange.split())
        if self.x_data:
            x = self.x_data
        else:
            x = linspace(wlrange[0], wlrange[1],self.N)
        n = []
        for i in range(0, self.N):
            sum = 0
            for j in range(1, len(coeffs)-1,2):
                sum += (coeffs[j]*x[i]**2)/(x[i]**2 - coeffs[j+1])
            sum += coeffs[0]
            n.append(sqrt(sum+1))
        return x, n
    def f3(self, coeffs, wlrange):
        coeffs = map(float, coeffs.split())
        wlrange = map(float, wlrange.split())
        x = linspace(wlrange[0], wlrange[1], self.N)
        n = []
        for i in range(0, self.N):
            sum = 0
            for j in range(1, len(coeffs)-1,2):
                sum += coeffs[j]*x[i]**coeffs[j+1]
            sum += coeffs[0]
            n.append(sqrt(sum))
        return x, n
    
    def f4(self, coeffs, wlrange):
        coeffs = map(float, coeffs.split())
        wlrange = map(float, wlrange.split())
        x = linspace(wlrange[0], wlrange[1], self.N)
        n = []
        
        for i in range(0, self.N):
            sum = coeffs[0]
            for j in range(1,8,4):
                sum += (coeffs[j]*x[i]**coeffs[j+1])/(x[i]**2 - coeffs[j+2]**coeffs[j+3])
            if len(coeffs)>9:
                for k in range(9, len(coeffs)-1,2):
                    sum += coeffs[k]*x[i]**coeffs[k+1]
            n.append(sqrt(sqrt(sum**2)))
        return x, n

    def f5(self, coeffs, wlrange):
        coeffs = map(float, coeffs.split())
        wlrange = map(float, wlrange.split())
        if self.x_data:
            x = self.x_data
        else:
            x = linspace(wlrange[0], wlrange[1],self.N)
        n = []
        for i in range(0, self.N):
            sum = 0
            for j in range(1, len(coeffs)-1,2):
                sum += coeffs[j]*x[i]**coeffs[j+1]
            sum += coeffs[0]
            n.append(sum)
        return x, n
    

    def tbk(self, data):
        data = data.split('\n')
        data.pop()
        data = [row.split(' ') for row in data]
        x = [float(row[0]) for row in data]
        k = [float(row[1]) for row in data]

        return x, k
